from ...domain.entities.biometric_sample import BiometricSample
from ...domain.entities.user import User
from ...domain.exceptions import BiometricNotFoundError
from ...application.ports.out.user_repository import UserRepository
from .mongodb_biometric_repository import MongoDBBiometricRepository
from .postgres_user_repository import PostgresUserRepository


class BiometricUserRepository(UserRepository):
    def __init__(self, postgres: PostgresUserRepository, mongo: MongoDBBiometricRepository) -> None:
        self.postgres = postgres
        self.mongo = mongo

    def initialize(self) -> None:
        self.mongo.initialize()

    def get_by_username(self, username: str) -> User | None:
        return self._with_face(self.postgres.get_by_username(username))

    def list_users(self) -> list[User]:
        return [self._with_face(user) for user in self.postgres.list_users()]

    def has_fingerprint(self, user_id: int) -> bool:
        return self.mongo.has_fingerprint(user_id)

    def save(self, user: User) -> User:
        saved = self.postgres.save(user)
        if user.face_encoding is not None:
            self.mongo.save_face(saved.id, user.face_encoding)
        return self._with_face(saved)

    def save_sample(self, sample: BiometricSample) -> BiometricSample:
        if self.postgres.get_by_id(sample.user_id) is None:
            raise ValueError("El usuario no existe en PostgreSQL")
        return self.mongo.save_sample(sample)

    def save_user_with_sample(self, user: User, sample_format: int | None, data_base64: str, quality: int | None) -> BiometricSample:
        saved_user = self.save(user)
        return self.save_sample(BiometricSample(None, saved_user.id, sample_format, data_base64, quality, None))

    def list_samples(self) -> list[tuple[BiometricSample, User]]:
        result = []
        for sample in self.mongo.list_samples():
            user = self._with_face(self.postgres.get_by_id(sample.user_id))
            if user is not None:
                result.append((sample, user))
        return result

    def revoke_face(self, user_id: int) -> None:
        if self.postgres.get_by_id(user_id) is None:
            raise BiometricNotFoundError("Sujeto no encontrado")
        self.mongo.revoke_face(user_id)

    def delete_subject_data(self, user_id: int) -> None:
        if self.postgres.get_by_id(user_id) is None:
            raise BiometricNotFoundError("Sujeto no encontrado")
        # Orden: primero biométricos (Mongo), luego identidad (Postgres).
        self.mongo.delete_biometrics(user_id)
        self.postgres.deactivate(user_id)

    def _with_face(self, user: User | None) -> User | None:
        if user is None:
            return None
        user.face_encoding = self.mongo.face_encoding(user.id)
        return user