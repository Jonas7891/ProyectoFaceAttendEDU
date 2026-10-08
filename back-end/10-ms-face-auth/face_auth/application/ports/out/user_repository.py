"""Persistence port for identities and biometric samples."""
from abc import ABC, abstractmethod

from ....domain.entities.biometric_sample import BiometricSample
from ....domain.entities.user import User


class UserRepository(ABC):
    @abstractmethod
    def get_by_username(self, username: str) -> User | None:
        raise NotImplementedError

    @abstractmethod
    def list_users(self) -> list[User]:
        raise NotImplementedError

    @abstractmethod
    def has_fingerprint(self, user_id: int) -> bool:
        raise NotImplementedError

    @abstractmethod
    def save(self, user: User) -> User:
        raise NotImplementedError

    @abstractmethod
    def save_sample(self, sample: BiometricSample) -> BiometricSample:
        raise NotImplementedError

    @abstractmethod
    def save_user_with_sample(
        self,
        user: User,
        sample_format: int | None,
        data_base64: str,
        quality: int | None,
    ) -> BiometricSample:
        raise NotImplementedError

    @abstractmethod
    def list_samples(self) -> list[tuple[BiometricSample, User]]:
        raise NotImplementedError

    @abstractmethod
    def revoke_face(self, user_id: int) -> None:
        raise NotImplementedError

    @abstractmethod
    def delete_subject_data(self, user_id: int) -> None:
        raise NotImplementedError
