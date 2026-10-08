"""Casos de uso de ciclo de vida: revocación y supresión (privacidad por diseño)."""
from __future__ import annotations

from ..ports.in_.lifecycle_use_cases import DeleteBiometricDataUseCase, RevokeBiometricTemplateUseCase
from ...domain.exceptions import BiometricNotFoundError
from ..ports.out.audit_sink import AuditSink
from ..ports.out.user_repository import UserRepository
from ...domain.value_objects import AuditAction


class _NullAudit(AuditSink):
    def record(self, action: str, subject: str | None, detail: str = "") -> None:
        return None

    def list_events(self, limit: int = 100) -> list[dict]:
        return []


class RevokeBiometricTemplate(RevokeBiometricTemplateUseCase):
    """Invalida plantillas sin borrar la identidad (ej. compromiso, re-enrollment)."""

    def __init__(self, repository: UserRepository, audit: AuditSink | None = None) -> None:
        self.repository = repository
        self.audit = audit or _NullAudit()

    def execute(self, username: str) -> str:
        username = username.strip()
        if not username:
            raise ValueError("El usuario es requerido")
        user = self.repository.get_by_username(username)
        if user is None or user.id is None:
            raise BiometricNotFoundError("Sujeto no encontrado")
        self.repository.revoke_face(user.id)
        self.audit.record(AuditAction.REVOKE.value, username, "face template revoked")
        return username


class DeleteBiometricData(DeleteBiometricDataUseCase):
    """Supresión efectiva: identidad + rostro + huellas. Irreversible."""

    def __init__(self, repository: UserRepository, audit: AuditSink | None = None) -> None:
        self.repository = repository
        self.audit = audit or _NullAudit()

    def execute(self, username: str) -> str:
        username = username.strip()
        if not username:
            raise ValueError("El usuario es requerido")
        user = self.repository.get_by_username(username)
        if user is None or user.id is None:
            raise BiometricNotFoundError("Sujeto no encontrado")
        self.repository.delete_subject_data(user.id)
        # Auditoría sin biométricos: solo identidad pseudonimizada + acción.
        self.audit.record(AuditAction.DELETE.value, username, "subject data deleted")
        return username
