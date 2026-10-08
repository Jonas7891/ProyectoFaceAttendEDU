from dataclasses import dataclass
from datetime import datetime


@dataclass
class User:
    id: int | None
    username: str
    face_encoding: str | None
    created_at: datetime | None

    def __post_init__(self) -> None:
        self.username = self.username.strip()
        if not self.username:
            raise ValueError("El usuario es requerido")
        if len(self.username) > 150:
            raise ValueError("El usuario no puede superar los 150 caracteres")

    @property
    def has_face(self) -> bool:
        return self.face_encoding is not None
