"""Session + RBAC guard for the biometric routers.

Same contract as the Java ``AuthTokenFilter`` used by the other services: the
Bearer token is an opaque session UUID validated against identity, and the
required permission is evaluated by authorization.
"""
from __future__ import annotations

import logging
import re
from urllib.parse import quote

import httpx
from fastapi import HTTPException, Request, status

from infrastructure.config.settings import get_settings

logger = logging.getLogger("biometric.security")

_UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE
)
_TIMEOUT_SECONDS = 4.0


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


def require_permission(permission: str | None):
    """Build a dependency that needs an active session and, when given, a permission."""

    async def dependency(request: Request) -> None:
        settings = get_settings()
        if not settings.auth_enabled:
            return
        token = _bearer(request)
        try:
            code, session = await _get_json(
                f"{settings.identity_url}/api/v1/sessions/{token}", token
            )
        except httpx.HTTPError:
            logger.warning("identity unreachable while validating a session")
            raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Cannot verify session")
        if code != 200 or not session or session.get("sessionStatus") != "Active" or not session.get("userId"):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired session")
        if permission is None:
            return
        url = (
            f"{settings.authorization_url}/api/v1/auth/evaluate"
            f"?userId={quote(str(session['userId']))}&permission={quote(permission)}"
        )
        try:
            code, result = await _get_json(url, token)
        except httpx.HTTPError:
            logger.warning("authorization unreachable while evaluating %s", permission)
            raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Cannot verify permissions")
        if code != 200 or not result or result.get("allowed") is not True:
            raise HTTPException(status.HTTP_403_FORBIDDEN, f"Forbidden: requires {permission}")
        request.state.user_id = str(session["userId"])

    return dependency
