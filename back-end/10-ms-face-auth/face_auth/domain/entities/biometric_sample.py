from dataclasses import dataclass
from datetime import datetime


@dataclass
class BiometricSample:
    id: int | None
    user_id: int
    sample_format: int | None
    data_base64: str
    quality: int | None
    created_at: datetime | None

    def __post_init__(self) -> None:
        if self.user_id <= 0:
            raise ValueError("El usuario de la muestra no es válido")
        if not self.data_base64.strip():
            raise ValueError("La muestra de huella es requerida")
