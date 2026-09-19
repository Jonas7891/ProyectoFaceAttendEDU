from dataclasses import dataclass
from uuid import UUID
from datetime import datetime
@dataclass
class FacialEmbedding:
    person_id: UUID
    encoding: list[float]
    model_version: str
    is_active: bool = True
    enrolled_at: datetime = None
