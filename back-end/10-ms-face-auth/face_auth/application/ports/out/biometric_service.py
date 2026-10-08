"""Port for biometric decoding and matching implementations."""
from abc import ABC, abstractmethod
from typing import Any


class BiometricService(ABC):
    @abstractmethod
    def decode_image(self, data_url: str) -> Any:
        raise NotImplementedError

    @abstractmethod
    def decode_fingerprint(self, data_base64: str) -> Any:
        raise NotImplementedError

    @abstractmethod
    def face_encoding(self, image: Any) -> Any:
        raise NotImplementedError

    @abstractmethod
    def validate_liveness(self, images: list[Any], actions: list[str]) -> bool:
        raise NotImplementedError

    @abstractmethod
    def face_distance(self, stored_encoding: str, query_encoding: Any) -> float:
        raise NotImplementedError

    @abstractmethod
    def fingerprint_score(self, query_image: Any, stored_image: Any) -> int:
        raise NotImplementedError
