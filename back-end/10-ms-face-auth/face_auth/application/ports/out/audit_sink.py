"""Append-only audit output port."""
from abc import ABC, abstractmethod
from typing import Any


class AuditSink(ABC):
    @abstractmethod
    def record(self, action: str, subject: str | None, detail: str = "") -> None:
        raise NotImplementedError

    @abstractmethod
    def list_events(self, limit: int = 100) -> list[dict[str, Any]]:
        raise NotImplementedError
