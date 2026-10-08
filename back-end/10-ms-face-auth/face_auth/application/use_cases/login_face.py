import json
from typing import Any

from ..ports.in_.authentication_use_cases import LoginFaceUseCase
from ..ports.out.biometric_service import BiometricService
from ..ports.out.user_repository import UserRepository


class LoginFace(LoginFaceUseCase):
    def __init__(self, repository: UserRepository, biometric: BiometricService, threshold: float) -> None:
        self.repository = repository
        self.biometric = biometric
        self.threshold = threshold

    def execute(
        self,
        image: Any,
        liveness_images: list[Any] | None = None,
        liveness_actions: list[str] | None = None,
        liveness_verified: bool = False,
    ) -> tuple[str, float]:
        if not liveness_verified and not self.biometric.validate_liveness(liveness_images or [], liveness_actions or []):
            raise PermissionError("No se pudo comprobar que el rostro está vivo")
        encoding = self.biometric.face_encoding(image)
        if encoding is None:
            raise ValueError("No se detectó un rostro en la imagen")
        best_username = None
        best_distance = 1.0
        for user in self.repository.list_users():
            if user.face_encoding is None:
                continue
            try:
                distance = self.biometric.face_distance(user.face_encoding, encoding)
            except (TypeError, ValueError, json.JSONDecodeError):
                continue
            if distance < best_distance:
                best_distance, best_username = distance, user.username
        if best_username is None or best_distance > self.threshold:
            raise PermissionError("Rostro no reconocido")
        return best_username, best_distance
