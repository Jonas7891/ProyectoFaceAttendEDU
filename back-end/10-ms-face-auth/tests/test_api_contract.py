"""Contract tests de la API sin TestClient (sin httpx): verifican rutas y casos de uso cableados."""
from __future__ import annotations

from fastapi import FastAPI

from face_auth.application.use_cases.lifecycle import DeleteBiometricData, RevokeBiometricTemplate
from face_auth.domain.entities.user import User
from face_auth.infrastructure.security.audit import InMemoryAuditSink
from face_auth.infrastructure.web.routers.lifecycle_router import router

from tests.test_use_cases import InMemoryUserRepository


def _wired() -> tuple[InMemoryUserRepository, InMemoryAuditSink, FastAPI]:
    repo = InMemoryUserRepository([User(1, "alice", "[0.1]", None)])
    audit = InMemoryAuditSink()
    app = FastAPI()
    app.include_router(router)
    return repo, audit, app


def test_lifecycle_routes_registered():
    _, _, app = _wired()
    paths = set(app.openapi().get("paths", {}).keys())
    assert "/api/templates/{username}/revoke" in paths
    assert "/api/subjects/{username}" in paths
    assert "/api/audit/events" in paths


def test_revoke_wiring_ok():
    repo, audit, _ = _wired()
    assert RevokeBiometricTemplate(repo, audit).execute("alice") == "alice"
    assert repo.get_by_username("alice").face_encoding is None


def test_delete_wiring_ok_and_second_delete_raises():
    from face_auth.domain.exceptions import BiometricNotFoundError

    repo, audit, _ = _wired()
    assert DeleteBiometricData(repo, audit).execute("alice") == "alice"
    try:
        DeleteBiometricData(repo, audit).execute("alice")
        raise AssertionError("debió fallar el segundo borrado")
    except BiometricNotFoundError:
        pass


def test_audit_wiring_lists_without_biometrics():
    _, audit, _ = _wired()
    audit.record("verify_success", "alice", "face")
    events = audit.list_events(limit=10)
    assert events[0]["action"] == "verify_success"
