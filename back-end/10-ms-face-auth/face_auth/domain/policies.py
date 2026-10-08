"""Políticas de dominio: umbrales, calidad mínima y decisiones de matching."""
from __future__ import annotations

from .value_objects import FingerprintThreshold, MatchThreshold, QualityScore

MIN_FINGERPRINT_QUALITY = 30
DEFAULT_FACE_THRESHOLD = 0.6
DEFAULT_FINGERPRINT_THRESHOLD = 8


def face_match(distance: float, threshold: MatchThreshold) -> bool:
    """True si la distancia está dentro del umbral (boundary inclusivo = match)."""
    return distance <= threshold.value


def fingerprint_match(score: int, threshold: FingerprintThreshold) -> bool:
    return score >= threshold.value


def fingerprint_quality_ok(quality: int | None) -> bool:
    if quality is None:
        return True  # calidad opcional según contrato actual; se registra pero no bloquea
    return QualityScore(quality).value >= MIN_FINGERPRINT_QUALITY
