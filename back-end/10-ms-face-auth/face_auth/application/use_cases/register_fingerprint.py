from ...domain.entities.user import User
from ...domain.entities.biometric_sample import BiometricSample
from ..ports.in_.authentication_use_cases import RegisterFingerprintUseCase
from ..ports.out.biometric_service import BiometricService
from ..ports.out.user_repository import UserRepository


class RegisterFingerprint(RegisterFingerprintUseCase):
    def __init__(self, repository: UserRepository, biometric: BiometricService, match_threshold: int = 8) -> None:
        self.repository = repository
        self.biometric = biometric
        self.match_threshold = match_threshold

    def execute(self, username: str, sample_format: int | None, data_base64: str, quality: int | None) -> BiometricSample:
        username = username.strip()
        if not username:
            raise ValueError("El usuario es requerido")
        if not data_base64:
            raise ValueError("La muestra de huella es requerida")
        query_image = self.biometric.decode_fingerprint(data_base64)
        for registered_sample, _ in self.repository.list_samples():
            try:
                score = self.biometric.fingerprint_score(query_image, registered_sample.data_base64)
            except Exception:
                continue
            if score >= self.match_threshold:
                raise ValueError("Esa huella ya está registrada")
        user = self.repository.get_by_username(username)
        if user is None:
            user = User(None, username, None, None)
        return self.repository.save_user_with_sample(user, sample_format, data_base64, quality)
