"""Inbound contracts for biometric authentication use cases."""
from abc import ABC, abstractmethod
from typing import Any

from ....domain.entities.biometric_sample import BiometricSample
from ....domain.entities.user import User


class RegisterFaceUseCase(ABC):
    @abstractmethod
    def execute(
        self,
        username: str,
        image: Any,
        liveness_images: list[Any] | None = None,
        liveness_actions: list[str] | None = None,
        liveness_verified: bool = False,
    ) -> User:
        raise NotImplementedError


class LoginFaceUseCase(ABC):
    @abstractmethod
    def execute(
        self,
        image: Any,
        liveness_images: list[Any] | None = None,
        liveness_actions: list[str] | None = None,
        liveness_verified: bool = False,
    ) -> tuple[str, float]:
        """Return the authenticated username and face distance."""
        raise NotImplementedError


class RegisterFingerprintUseCase(ABC):
    @abstractmethod
    def execute(
        self, username: str, sample_format: int | None, data_base64: str, quality: int | None
    ) -> BiometricSample:
        raise NotImplementedError


class LoginFingerprintUseCase(ABC):
    @abstractmethod
    def execute(self, query_image: Any) -> tuple[str, int]:
        """Return the authenticated username and fingerprint score."""
        raise NotImplementedError
