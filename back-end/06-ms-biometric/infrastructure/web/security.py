"""Session + RBAC guard for the biometric routers — REST and WebSocket.

Same contract as the Java ``AuthTokenFilter`` used by the other services: the
Bearer token is an opaque session UUID validated against identity, and the
required permission is evaluated by authorization.

`_validate_session_and_permission` is the one rule both transports use:
`require_permission` wraps it for REST (raises `HTTPException`),
`authenticate_websocket` wraps it for the WS handshake (raises
`WebSocketAuthError`, since a WebSocket connection has no HTTP status line to
carry the rejection).
"""
from __future__ import annotations

import logging
import re
from urllib.parse import quote

import httpx
from fastapi import HTTPException, Request, WebSocket, status

from infrastructure.config.settings import get_settings

logger = logging.getLogger("biometric.security")

_UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE
)
_TIMEOUT_SECONDS = 4.0

# WS close codes in the private-use range (RFC 6455 §7.4.2), mirroring the
# REST status they replace — a WebSocket handshake has no status line.
WS_CLOSE_UNAUTHORIZED = 4401
WS_CLOSE_FORBIDDEN = 4403
WS_CLOSE_SERVICE_UNAVAILABLE = 4503

_WS_CLOSE_BY_STATUS = {
    status.HTTP_401_UNAUTHORIZED: WS_CLOSE_UNAUTHORIZED,
    status.HTTP_403_FORBIDDEN: WS_CLOSE_FORBIDDEN,
    status.HTTP_503_SERVICE_UNAVAILABLE: WS_CLOSE_SERVICE_UNAVAILABLE,
}


class _AuthError(Exception):
    """Internal: carries the HTTP-shaped status the caller maps to its transport."""

    def __init__(self, status_code: int, detail: str) -> None:
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


class WebSocketAuthError(Exception):
    """Raised by `authenticate_websocket`; `code`/`reason` go straight to `websocket.close`."""

    def __init__(self, code: int, reason: str) -> None:
        self.code = code
        self.reason = reason
        super().__init__(reason)


async def _get_json(url: str, token: str) -> tuple[int, dict | None]:
    async with httpx.AsyncClient(timeout=_TIMEOUT_SECONDS) as client:
        response = await client.get(url, headers={"Authorization": f"Bearer {token}"})
    body = response.json() if response.status_code == 200 else None
    return response.status_code, body if isinstance(body, dict) else None


def _bearer(request: Request) -> str:
    header = request.headers.get("authorization", "")
    if not header.lower().startswith("bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    token = header[7:].strip()
    if not _UUID_RE.match(token):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token format")
    return token


def _extract_ws_token(websocket: WebSocket) -> str | None:
    """Browsers cannot set custom headers on a WS handshake, so the token also
    travels as `?token=`; non-browser clients may still send a Bearer header."""
    token = websocket.query_params.get("token")
    if token:
        return token.strip()
    header = websocket.headers.get("authorization", "")
    if header.lower().startswith("bearer "):
        return header[7:].strip()
    return None


async def _validate_session_and_permission(token: str, permission: str | None) -> str:
    """Shared rule: active session, then (when given) the required permission.

    Returns the authenticated user id. Raises `_AuthError` on any failure.
    """
    if not _UUID_RE.match(token):
        raise _AuthError(status.HTTP_401_UNAUTHORIZED, "Invalid token format")

    settings = get_settings()
    try:
        code, session = await _get_json(
            f"{settings.identity_url}/api/v1/sessions/{token}", token
        )
    except httpx.HTTPError:
        logger.warning("identity unreachable while validating a session")
        raise _AuthError(status.HTTP_503_SERVICE_UNAVAILABLE, "Cannot verify session")
    if code != 200 or not session or session.get("sessionStatus") != "Active" or not session.get("userId"):
        raise _AuthError(status.HTTP_401_UNAUTHORIZED, "Invalid or expired session")

    user_id = str(session["userId"])
    if permission is None:
        return user_id

    url = (
        f"{settings.authorization_url}/api/v1/auth/evaluate"
        f"?userId={quote(user_id)}&permission={quote(permission)}"
    )
    try:
        code, result = await _get_json(url, token)
    except httpx.HTTPError:
        logger.warning("authorization unreachable while evaluating %s", permission)
        raise _AuthError(status.HTTP_503_SERVICE_UNAVAILABLE, "Cannot verify permissions")
    if code != 200 or not result or result.get("allowed") is not True:
        raise _AuthError(status.HTTP_403_FORBIDDEN, f"Forbidden: requires {permission}")
    return user_id


def require_permission(permission: str | None):
    """Build a REST dependency that needs an active session and, when given, a permission."""

    async def dependency(request: Request) -> None:
        settings = get_settings()
        if not settings.auth_enabled:
            return
        token = _bearer(request)
        try:
            request.state.user_id = await _validate_session_and_permission(token, permission)
        except _AuthError as exc:
            raise HTTPException(exc.status_code, exc.detail) from exc

    return dependency


async def authenticate_websocket(websocket: WebSocket, permission: str | None) -> str | None:
    """Same rule as `require_permission`, for a WS handshake.

    Returns the authenticated user id, or `None` when auth is disabled. The
    caller must `websocket.accept()` before this is invoked, so a rejection
    can carry a close code and reason; this never raises `HTTPException`,
    there is no HTTP response left to attach one to.
    """
    settings = get_settings()
    if not settings.auth_enabled:
        return None
    token = _extract_ws_token(websocket)
    if not token:
        raise WebSocketAuthError(WS_CLOSE_UNAUTHORIZED, "Missing bearer token")
    try:
        return await _validate_session_and_permission(token, permission)
    except _AuthError as exc:
        code = _WS_CLOSE_BY_STATUS.get(exc.status_code, WS_CLOSE_UNAUTHORIZED)
        raise WebSocketAuthError(code, exc.detail) from exc
