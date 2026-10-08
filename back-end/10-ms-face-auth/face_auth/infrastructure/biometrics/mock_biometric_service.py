"""Mock determinista del proveedor biométrico para tests (datos sintéticos).

Nunca toca red, disco ni SDK nativo. Vectores de 128 dims como face_recognition.
"""
from __future__ import annotations

import json
from typing import Any

from ...application.ports.out.biometric_service import BiometricService


class MockBiometricService(BiometricService):
    """Encoding sintético derivado del payload: determinista y aislado por usuario."""

    def decode_image(self, data_url: str) -> str:
        if not data_url:
            raise ValueError("Imagen inválida: vacía")
        return data_url

    def decode_fingerprint(self, data_base64: str) -> str:
        if not data_base64:
            raise ValueError("Muestra de huella inválida: vacía")
        return data_base64

    def face_encoding(self, image: Any) -> list[float] | None:
        if image == "no-face":
            return None
        seed = abs(hash(str(image))) % 1000 / 1000.0
        base = [seed] * 128
        class _Enc(list):
            def tolist(self) -> list[float]:
                return list(self)
        return _Enc(base)  # type: ignore[return-value]

    def validate_liveness(self, images: list[Any], actions: list[str]) -> bool:
        return bool(images) and bool(actions)

    def face_distance(self, stored_encoding: str, query_encoding: Any) -> float:
        stored = json.loads(stored_encoding)
        query = list(query_encoding.tolist() if hasattr(query_encoding, "tolist") else query_encoding)
        if str(stored) == str(query):
            return 0.0
        return 0.9

    def fingerprint_score(self, query_image: Any, stored_image: Any) -> int:
        return 100 if query_image == stored_image else 0
