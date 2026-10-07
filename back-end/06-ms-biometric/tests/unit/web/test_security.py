"""Session + RBAC guard on the biometric routers.

The identity/authorization HTTP calls are replaced by an in-process fake, so no
network is needed. Business behaviour is covered in test_router_contract.py
(with the guard disabled); here the guard is switched on.
"""
from __future__ import annotations

from urllib.parse import unquote

import httpx
import pytest
from fastapi.testclient import TestClient

from domain.value_objects.biometric_type import BiometricType
from infrastructure.config.dependencies import (
    get_facial_repository,
    get_match_log_repository,
    get_update_case_repository,
)
from infrastructure.config.settings import get_settings
from infrastructure.web import security
from main import app
from tests.support.in_memory_repositories import (
    InMemoryBiometricRepository,
    InMemoryMatchLogRepository,
    InMemoryUpdateCaseRepository,
)

ADMIN = "11111111-1111-1111-1111-111111111111"
STUDENT = "22222222-2222-2222-2222-222222222222"
CLOSED = "33333333-3333-3333-3333-333333333333"
PERMISSIONS = {
    "admin": {"attendance.record:write", "biometric.case:request", "biometric.case:review"},
    "student": {"biometric.case:request"},
}


async def _fake_get_json(url: str, token: str):
    if "/api/v1/sessions/" in url:
        sessions = {
            ADMIN: {"sessionStatus": "Active", "userId": "admin"},
            STUDENT: {"sessionStatus": "Active", "userId": "student"},
            CLOSED: {"sessionStatus": "Closed", "userId": "admin"},
        }
        session = sessions.get(url.rsplit("/", 1)[1])
        return (200, session) if session else (404, None)
    user = url.split("userId=")[1].split("&")[0]
    permission = unquote(url.split("permission=")[1])
    return 200, {"allowed": permission in PERMISSIONS[user]}


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv("BIOMETRIC_MONGO_ENABLED", "false")
    monkeypatch.setenv("BIOMETRIC_AUTH_ENABLED", "true")
    get_settings.cache_clear()
    monkeypatch.setattr(security, "_get_json", _fake_get_json)

    app.dependency_overrides[get_facial_repository] = lambda: InMemoryBiometricRepository(BiometricType.FACIAL)
    app.dependency_overrides[get_update_case_repository] = lambda: InMemoryUpdateCaseRepository()
    app.dependency_overrides[get_match_log_repository] = lambda: InMemoryMatchLogRepository()

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    get_settings.cache_clear()


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_missing_token_is_unauthorized(client):
    response = client.get("/api/v1/biometric/facial/person-1")
    assert response.status_code == 401
    assert response.json()["error"] == "Unauthorized"


def test_malformed_token_is_unauthorized(client):
    assert client.get("/api/v1/biometric/facial/person-1", headers=_auth("abc")).status_code == 401


def test_closed_session_is_unauthorized(client):
    assert client.get("/api/v1/biometric/facial/person-1", headers=_auth(CLOSED)).status_code == 401


def test_health_stays_public(client):
    assert client.get("/health").status_code == 200


def test_student_cannot_read_templates(client):
    response = client.get("/api/v1/biometric/facial/person-1", headers=_auth(STUDENT))
    assert response.status_code == 403
    assert response.json()["error"] == "Forbidden"


def test_admin_passes_the_guard_on_templates(client):
    # 404 = the guard let the request through and the template simply does not exist.
    assert client.get("/api/v1/biometric/facial/person-1", headers=_auth(ADMIN)).status_code == 404


def test_student_can_request_an_update_but_not_review_it(client):
    body = {"person_id": "p1", "biometric_type": "FACIAL", "reason": "new photo"}
    created = client.post("/api/v1/biometric/update-request", json=body, headers=_auth(STUDENT))
    assert created.status_code == 201
    review = client.patch(
        "/api/v1/biometric/update-request/x/review", json={"status": "Approved"}, headers=_auth(STUDENT)
    )
    assert review.status_code == 403


def test_identity_down_is_service_unavailable(client, monkeypatch):
    async def boom(url: str, token: str):
        raise httpx.ConnectError("identity down")

    monkeypatch.setattr(security, "_get_json", boom)
    assert client.get("/api/v1/biometric/facial/person-1", headers=_auth(ADMIN)).status_code == 503
