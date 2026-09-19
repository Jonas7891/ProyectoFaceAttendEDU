from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID


@dataclass
class FingerprintEmbedding:
    person_id: UUID
    finger_number: int
    encoding: list[float]
    model_version: str
    is_active: bool = True
    enrolled_at: datetime | None = None
    template_version: int = 1

    def __post_init__(self) -> None:
        if not 1 <= self.finger_number <= 10:
            raise ValueError("finger_number must be between 1 and 10")
