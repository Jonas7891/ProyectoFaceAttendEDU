"""Tests de ciclo de vida, políticas, rate-limit y auditoría (datos 100% sintéticos)."""
from __future__ import annotations

import pytest

from face_auth.application.use_cases.lifecycle import DeleteBiometricData, RevokeBiometricTemplate
from face_auth.application.use_cases.login_face import LoginFace
from face_auth.domain.entities.user import User
from face_auth.domain.exceptions import BiometricNotFoundError
from face_auth.domain.policies import face_match, fingerprint_match
from face_auth.domain.value_objects import FingerprintThreshold, MatchThreshold
from face_auth.infrastructure.security.audit import InMemoryAuditSink
from face_auth.infrastructure.security.rate_limit import RateLimiter

from tests.test_use_cases import FakeBiometricService, InMemoryUserRepository


def _repo_with_alice() -> InMemoryUserRepository:
    return InMemoryUserRepository([User(1, "alice", "[0.1, 0.2]", None)])


def test_threshold_boundary_inclusive_match():
    assert face_match(0.6, MatchThreshold(0.6)) is True
    assert face_match(0.6001, MatchThreshold(0.6)) is False


def test_fingerprint_threshold_boundary():
    assert fingerprint_match(8, FingerprintThreshold(8)) is True
    assert fingerprint_match(7, FingerprintThreshold(8)) is False


def test_revoke_template_clears_encoding_and_audits():
    repo, audit = _repo_with_alice(), InMemoryAuditSink()
    assert RevokeBiometricTemplate(repo, audit).execute("alice") == "alice"
    assert repo.get_by_username("alice").face_encoding is None
    assert audit.list_events()[0]["action"] == "revoke"


def test_revoke_unknown_subject_404_semantics():
    with pytest.raises(BiometricNotFoundError):
        RevokeBiometricTemplate(InMemoryUserRepository(), InMemoryAuditSink()).execute("ghost")


def test_delete_subject_removes_identity_and_audits():
    repo, audit = _repo_with_alice(), InMemoryAuditSink()
    assert DeleteBiometricData(repo, audit).execute("alice") == "alice"
    assert repo.get_by_username("alice") is None
    assert audit.list_events()[0]["action"] == "delete"


def test_delete_unknown_subject_raises():
    with pytest.raises(BiometricNotFoundError):
        DeleteBiometricData(InMemoryUserRepository(), InMemoryAuditSink()).execute("ghost")


def test_revoked_template_cannot_login():
    repo = _repo_with_alice()
    RevokeBiometricTemplate(repo, InMemoryAuditSink()).execute("alice")
    use_case = LoginFace(repo, FakeBiometricService(), threshold=0.6)
    use_case.biometric.face_distance = lambda stored, query: 0.2
    with pytest.raises(PermissionError, match="no reconocido"):
        use_case.execute("image", ["f"], ["blink"])


def test_audit_never_stores_biometrics():
    audit = InMemoryAuditSink()
    audit.record("verify_success", "alice", "face")
    for event in audit.list_events():
        assert "encoding" not in str(event).lower()
        assert "base64" not in str(event).lower()


def test_rate_limiter_blocks_after_max_attempts():
    limiter = RateLimiter(max_attempts=3, window_seconds=60)
    assert limiter.check("k")[0] is True
    assert limiter.check("k")[0] is True
    assert limiter.check("k")[0] is True
    allowed, remaining = limiter.check("k")
    assert allowed is False and remaining == 0


def test_reject_blank_username_lifecycle():
    with pytest.raises(ValueError, match="requerido"):
        DeleteBiometricData(InMemoryUserRepository()).execute("   ")
