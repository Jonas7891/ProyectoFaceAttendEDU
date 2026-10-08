from dataclasses import dataclass

import pytest

from face_auth.application.use_cases.login_face import LoginFace
from face_auth.application.use_cases.register_face import RegisterFace
from face_auth.application.use_cases.user_queries import UserQueries
from face_auth.domain.entities.biometric_sample import BiometricSample
from face_auth.domain.entities.user import User
from face_auth.application.ports.out.biometric_service import BiometricService
from face_auth.application.ports.out.user_repository import UserRepository


@dataclass
class FakeEncoding:
    values: list[float]

    def tolist(self) -> list[float]:
        return self.values


class FakeBiometricService(BiometricService):
    def decode_image(self, data_url: str) -> str:
        return data_url

    def decode_fingerprint(self, data_base64: str) -> str:
        return data_base64

    def face_encoding(self, image: str) -> FakeEncoding:
        return FakeEncoding([1.0, 2.0, 3.0])

    def validate_liveness(self, images: list[str], actions: list[str]) -> bool:
        return True

    def face_distance(self, stored_encoding: str, query_encoding: FakeEncoding) -> float:
        return 0.9

    def fingerprint_score(self, query_image: str, stored_image: str) -> int:
        return 0


class InMemoryUserRepository(UserRepository):
    def __init__(self, users: list[User] | None = None) -> None:
        self.users = users or []

    def get_by_username(self, username: str) -> User | None:
        return next((user for user in self.users if user.username == username), None)

    def list_users(self) -> list[User]:
        return self.users

    def has_fingerprint(self, user_id: int) -> bool:
        return False

    def save(self, user: User) -> User:
        if user.id is None:
            user.id = len(self.users) + 1
            self.users.append(user)
        return user

    def save_sample(self, sample: BiometricSample) -> BiometricSample:
        return sample

    def save_user_with_sample(self, user: User, sample_format: int | None, data_base64: str, quality: int | None) -> BiometricSample:
        saved_user = self.save(user)
        return BiometricSample(1, saved_user.id, sample_format, data_base64, quality, None)

    def list_samples(self) -> list[tuple[BiometricSample, User]]:
        return []

    def revoke_face(self, user_id: int) -> None:
        for user in self.users:
            if user.id == user_id:
                user.face_encoding = None

    def delete_subject_data(self, user_id: int) -> None:
        self.users = [u for u in self.users if u.id != user_id]


def test_register_face_creates_user_with_serialized_encoding():
    repository = InMemoryUserRepository()
    use_case = RegisterFace(repository, FakeBiometricService())

    user = use_case.execute(" alice ", "image", ["frame-1", "frame-2", "frame-3"], ["blink"])

    assert user.id == 1
    assert user.username == "alice"
    assert user.face_encoding == "[1.0, 2.0, 3.0]"


def test_register_face_rejects_matching_face_for_another_user():
    repository = InMemoryUserRepository([User(1, "alice", "[1, 2, 3]", None)])
    use_case = RegisterFace(repository, FakeBiometricService(), threshold=0.6)
    use_case.biometric.face_distance = lambda stored, query: 0.2

    with pytest.raises(ValueError, match="rostro ya está registrado"):
        use_case.execute("bob", "image", ["frame-1", "frame-2", "frame-3"], ["blink"])


def test_login_face_returns_best_matching_user():
    repository = InMemoryUserRepository([User(1, "alice", "[1, 2, 3]", None)])
    use_case = LoginFace(repository, FakeBiometricService(), threshold=0.6)
    use_case.biometric.face_distance = lambda stored, query: 0.2

    username, distance = use_case.execute("image", ["frame-1", "frame-2", "frame-3"], ["blink"])

    assert username == "alice"
    assert distance == 0.2


def test_login_face_rejects_failed_liveness_check():
    repository = InMemoryUserRepository([User(1, "alice", "[1, 2, 3]", None)])
    biometric = FakeBiometricService()
    biometric.validate_liveness = lambda images, actions: False
    use_case = LoginFace(repository, biometric, threshold=0.6)

    with pytest.raises(PermissionError, match="rostro está vivo"):
        use_case.execute("image", ["frame-1", "frame-2", "frame-3"], ["blink"])


def test_user_queries_return_directory_data_from_repository():
    repository = InMemoryUserRepository([User(1, "alice", "[1, 2, 3]", None)])
    queries = UserQueries(repository)

    assert queries.exists(" alice ") == {"exists": True, "has_face": True, "has_fingerprint": False}
    assert queries.exists("missing") == {"exists": False}
    assert queries.list_users() == [{
        "username": "alice",
        "has_face": True,
        "has_fingerprint": False,
    }]
    assert queries.list_active_users({"alice"}) == queries.list_users()
