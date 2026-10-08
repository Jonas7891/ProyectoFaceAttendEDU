import json
from typing import Any

from ...domain.entities.user import User
from ..ports.in_.authentication_use_cases import RegisterFaceUseCase
from ..ports.out.biometric_service import BiometricService
from ..ports.out.user_repository import UserRepository


class RegisterFace(RegisterFaceUseCase):
    def __init__(self, repository: UserRepository, biometric: BiometricService, threshold: float = 0.6) -> None:
        self.repository = repository
        self.biometric = biometric
        self.threshold = threshold

    def execute(
        self,
        username: str,
        image: Any,
        liveness_images: list[Any] | None = None,
        liveness_actions: list[str] | None = None,
        liveness_verified: bool = False,
    ) -> User:
        username = username.strip()
        if not username:
            raise ValueError("El usuario es requerido")
        if not liveness_verified and not self.biometric.validate_liveness(liveness_images or [], liveness_actions or []):
            raise ValueError("No se pudo comprobar que el rostro está vivo")
        encoding = self.biometric.face_encoding(image)
        if encoding is None:
            raise ValueError("No se detectó un rostro en la imagen")
        user = self.repository.get_by_username(username)
        for registered_user in self.repository.list_users():
            if registered_user.face_encoding is None or (user is not None and registered_user.id == user.id):
                continue
            try:
                distance = self.biometric.face_distance(registered_user.face_encoding, encoding)
            except (TypeError, ValueError, json.JSONDecodeError):
                continue
            if distance <= self.threshold:
                raise ValueError("Ese rostro ya está registrado para otro usuario")
        encoded = json.dumps(encoding.tolist())
        if user is None:
            user = User(None, username, encoded, None)
        else:
            user.face_encoding = encoded
        return self.repository.save(user)
