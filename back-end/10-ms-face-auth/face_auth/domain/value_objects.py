"""Value objects del dominio biométrico.

No contienen I/O ni dependencias de infraestructura.
Usar en entidades, políticas y casos de uso.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class BiometricModality(str, Enum):
    FACE = "face"
    FINGERPRINT = "fingerprint"


class TemplateStatus(str, Enum):
    ACTIVE = "active"
    REVOKED = "revoked"
    EXPIRED = "expired"
    DELETED = "deleted"


class AuditAction(str, Enum):
    ENROLL = "enroll"
    VERIFY_SUCCESS = "verify_success"
    VERIFY_FAILURE = "verify_failure"
    TOKEN_REFRESH = "token_refresh"
    TOKEN_REFRESH_FAILURE = "token_refresh_failure"
    LOGOUT = "logout"
    REVOKE = "revoke"
    DELETE = "delete"
    LIVENESS_FAILURE = "liveness_failure"
    UNAUTHORIZED = "unauthorized"


@dataclass(frozen=True, slots=True)
class MatchThreshold:
    """Umbral de decisión. Distancia facial: menor = más estricto."""

    value: float

    def __post_init__(self) -> None:
        if not 0.0 < self.value < 2.0:
            raise ValueError("El umbral facial debe estar en (0, 2)")


@dataclass(frozen=True, slots=True)
class FingerprintThreshold:
    value: int

    def __post_init__(self) -> None:
        if self.value < 0:
            raise ValueError("El umbral de huella no puede ser negativo")


@dataclass(frozen=True, slots=True)
class QualityScore:
    value: int

    def __post_init__(self) -> None:
        if not 0 <= self.value <= 100:
            raise ValueError("La calidad debe estar entre 0 y 100")
