"""Sesiones v2: access corto con claims completos + refresh opaco rotativo.

Aditivo y reversible: si `settings.session_v2_enabled` es False, los routers
devuelven la respuesta legacy exacta. Con el flag activo se añaden
`refresh_token` y `session_id` sin quitar ninguna clave existente.

Seguridad:
- access: HS256, sub/iss/aud/exp/iat/jti/sid/auth_time. TTL 5-15 min.
- refresh: opaco (token_urlsafe 32B), se guarda solo su SHA-256.
  Rotación en cada uso; el reuso de un refresh ya rotado revoca la familia
  completa (detección de robo). Vinculable a device_hash.
- Sin enumeración: los errores son genéricos.
- Comparaciones de secretos con hmac.compare_digest.
"""
from __future__ import annotations

import hashlib
import hmac
import secrets
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

import jwt

from ..config.settings import settings
from . import auth as legacy_auth


@dataclass
class RefreshRecord:
    username: str
    session_id: str
    family_id: str
    expires_at: float
    device_hash: str | None = None
    rotated: bool = False
    created_at: float = field(default_factory=time.time)


class SessionService:
    """Store en memoria por proceso (igual que el resto de auth.py).

    Con múltiples réplicas/workers mover a Redis con TTL (misma interfaz).
    """

    def __init__(self) -> None:
        self._refresh: dict[str, RefreshRecord] = {}  # sha256_hex -> record

    # -- emisión ---------------------------------------------------------

    def create_session(self, username: str, device_hash: str | None = None) -> dict:
        now = datetime.now(timezone.utc)
        access_ttl = settings.access_token_expire_minutes * 60
        session_id = uuid.uuid4().hex
        access = jwt.encode(
            {
                "iss": settings.jwt_issuer,
                "aud": settings.jwt_audience,
                "sub": username,
                "sid": session_id,
                "jti": uuid.uuid4().hex,
                "iat": int(now.timestamp()),
                "auth_time": int(now.timestamp()),
                "exp": now + timedelta(seconds=access_ttl),
            },
            legacy_auth.JWT_SECRET,
            algorithm="HS256",
        )
        refresh_ttl = settings.refresh_token_expire_minutes * 60
        family_id = uuid.uuid4().hex
        refresh = secrets.token_urlsafe(32)
        self._refresh[self._hash(refresh)] = RefreshRecord(
            username=username,
            session_id=session_id,
            family_id=family_id,
            expires_at=time.time() + refresh_ttl,
            device_hash=device_hash,
        )
        # Compat: mantiene el directorio de sesiones activas legacy.
        legacy_auth.register_active_session(username, (now + timedelta(seconds=access_ttl)).timestamp())
        self._prune()
        return {
            "access_token": access,
            "refresh_token": refresh,
            "session_id": session_id,
            "expires_in": access_ttl,
        }

    # -- refresh rotativo -------------------------------------------------

    def refresh(self, refresh_token: str, device_hash: str | None = None) -> dict:
        key = self._hash(refresh_token)
        record = self._refresh.get(key)
        if record is None or record.expires_at <= time.time():
            self._refresh.pop(key, None)
            raise ValueError("Sesión inválida o expirada")  # genérico: no revela causa
        if record.rotated:
            # Reuso detectado → posible robo: revoca la familia completa.
            self._revoke_family(record.family_id)
            raise ValueError("Sesión inválida o expirada")
        if record.device_hash and device_hash and not hmac.compare_digest(record.device_hash, device_hash):
            self._revoke_family(record.family_id)
            raise ValueError("Sesión inválida o expirada")
        record.rotated = True
        rotated = self.create_session(record.username, device_hash or record.device_hash)
        # Conserva la familia para detectar reuso del token padre.
        self._refresh[self._hash(rotated["refresh_token"])].family_id = record.family_id
        return rotated

    # -- logout / revocación ----------------------------------------------

    def logout(self, refresh_token: str | None = None, session_id: str | None = None) -> None:
        if refresh_token:
            record = self._refresh.get(self._hash(refresh_token))
            if record is not None:
                self._revoke_family(record.family_id)
                return
        if session_id:
            families = {r.family_id for r in self._refresh.values() if r.session_id == session_id}
            for family in families:
                self._revoke_family(family)

    def verify_access_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(
                token,
                legacy_auth.JWT_SECRET,
                algorithms=["HS256"],
                options={"require": ["exp", "sub"]},
            )
        except jwt.PyJWTError as exc:
            raise ValueError("Token inválido o expirado") from exc
        # Tokens legacy (solo sub/exp) siguen válidos; los nuevos exigen iss/aud.
        if "iss" in payload and payload["iss"] != settings.jwt_issuer:
            raise ValueError("Token inválido o expirado")
        if "aud" in payload and payload["aud"] != settings.jwt_audience:
            raise ValueError("Token inválido o expirado")
        return payload

    # -- internos ----------------------------------------------------------

    @staticmethod
    def _hash(value: str) -> str:
        return hashlib.sha256(value.encode()).hexdigest()

    def _revoke_family(self, family_id: str) -> None:
        for key in [k for k, r in self._refresh.items() if r.family_id == family_id]:
            self._refresh.pop(key, None)

    def _prune(self, max_size: int = 10000) -> None:
        now = time.time()
        for key in [k for k, r in self._refresh.items() if r.expires_at <= now]:
            self._refresh.pop(key, None)
        if len(self._refresh) > max_size:
            oldest = sorted(self._refresh.items(), key=lambda item: item[1].created_at)
            for key, _ in oldest[: len(self._refresh) - max_size]:
                self._refresh.pop(key, None)
