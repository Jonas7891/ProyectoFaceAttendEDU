from typing import Any
import logging

from ..ports.in_.authentication_use_cases import LoginFingerprintUseCase
from ..ports.out.biometric_service import BiometricService
from ..ports.out.user_repository import UserRepository

logger = logging.getLogger(__name__)


class LoginFingerprint(LoginFingerprintUseCase):
    def __init__(self, repository: UserRepository, biometric: BiometricService, match_threshold: int = 8) -> None:
        self.repository = repository
        self.biometric = biometric
        self.match_threshold = match_threshold

    def execute(self, query_image: Any) -> tuple[str, int]:
        best_user = None
        best_score = 0
        for sample, user in self.repository.list_samples():
            try:
                score = self.biometric.fingerprint_score(query_image, sample.data_base64)
                logger.info("Fingerprint candidate user=%s sample=%s score=%s", user.username, sample.id, score)
            except Exception:
                logger.exception("Fingerprint comparison failed user=%s sample=%s", user.username, sample.id)
                continue
            if score > best_score:
                best_score, best_user = score, user
        if best_user is None or best_score < self.match_threshold:
            raise PermissionError("Huella no reconocida")
        return best_user.username, best_score
