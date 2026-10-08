"""Tests de sesión v2: claims, refresh rotativo, reuso, logout, compat legacy."""
from __future__ import annotations

import jwt
import pytest

from face_auth.infrastructure.config.settings import settings
from face_auth.infrastructure.web import auth as legacy_auth
from face_auth.infrastructure.web.session_service import SessionService


@pytest.fixture()
def service() -> SessionService:
    return SessionService()


def test_access_token_has_full_claims(service: SessionService):
    session = service.create_session("alice")
    payload = jwt.decode(session["access_token"], legacy_auth.JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
    assert payload["sub"] == "alice"
    assert payload["iss"] == settings.jwt_issuer
    assert payload["aud"] == settings.jwt_audience
    for claim in ("jti", "sid", "iat", "auth_time", "exp"):
        assert claim in payload
    assert session["session_id"] == payload["sid"]


def test_legacy_token_without_iss_aud_still_verifies(service: SessionService):
    from datetime import datetime, timedelta, timezone

    legacy = jwt.encode(
        {"sub": "bob", "exp": datetime.now(timezone.utc) + timedelta(minutes=5)},
        legacy_auth.JWT_SECRET,
        algorithm="HS256",
    )
    assert service.verify_access_token(legacy)["sub"] == "bob"


def test_refresh_rotation_issues_new_pair_and_invalidates_old(service: SessionService):
    first = service.create_session("alice")
    second = service.refresh(first["refresh_token"])
    assert second["refresh_token"] != first["refresh_token"]
    assert second["access_token"] != first["access_token"]
    with pytest.raises(ValueError, match="inválida o expirada"):
        service.refresh(first["refresh_token"])


def test_refresh_reuse_after_rotation_revokes_family(service: SessionService):
    first = service.create_session("alice")
    second = service.refresh(first["refresh_token"])
    # Reuso del token padre (ya rotado) → familia revocada, sin enumerar causa.
    with pytest.raises(ValueError, match="inválida o expirada"):
        service.refresh(first["refresh_token"])
    with pytest.raises(ValueError, match="inválida o expirada"):
        service.refresh(second["refresh_token"])


def test_logout_revokes_family(service: SessionService):
    session = service.create_session("alice")
    service.logout(refresh_token=session["refresh_token"])
    with pytest.raises(ValueError, match="inválida o expirada"):
        service.refresh(session["refresh_token"])


def test_logout_unknown_token_is_idempotent(service: SessionService):
    service.logout(refresh_token="token-inexistente-valido-1234567890")
    service.logout(session_id="sid-inexistente")


def test_device_mismatch_revokes_family(service: SessionService):
    session = service.create_session("alice", device_hash="device-a")
    with pytest.raises(ValueError, match="inválida o expirada"):
        service.refresh(session["refresh_token"], device_hash="device-b")
    with pytest.raises(ValueError, match="inválida o expirada"):
        service.refresh(session["refresh_token"], device_hash="device-a")


def test_tampered_access_token_rejected(service: SessionService):
    session = service.create_session("alice")
    tampered = session["access_token"][:-4] + "abcd"
    with pytest.raises(ValueError, match="inválido"):
        service.verify_access_token(tampered)
