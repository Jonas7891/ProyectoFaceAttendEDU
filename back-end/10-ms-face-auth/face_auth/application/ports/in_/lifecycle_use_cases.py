"""Inbound contracts for biometric lifecycle operations."""
from abc import ABC, abstractmethod


class RevokeBiometricTemplateUseCase(ABC):
    @abstractmethod
    def execute(self, username: str) -> str:
        raise NotImplementedError


class DeleteBiometricDataUseCase(ABC):
    @abstractmethod
    def execute(self, username: str) -> str:
        raise NotImplementedError
