"""Audit sink append-only sobre MongoDB (colección separada, sin update/delete)."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from ...application.ports.out.audit_sink import AuditSink

try:
    from pymongo.database import Database
except Exception:  # pragma: no cover - permite importar sin pymongo en unit tests
    Database = Any  # type: ignore


class MongoAuditSink(AuditSink):
    def __init__(self, database: Any) -> None:
        self.events = database["audit_events"]
        try:
            self.events.create_index([("created_at", -1)], name="idx_audit_created_at")
            self.events.create_index([("action", 1)], name="idx_audit_action")
        except Exception:
            pass  # Mongo no disponible en tests con fakes

    def record(self, action: str, subject: str | None, detail: str = "") -> None:
        # NUNCA registrar biométricos crudos, encodings, imágenes ni scores internos.
        self.events.insert_one({
            "action": action,
            "subject": subject,
            "detail": detail[:500],
            "created_at": datetime.now(timezone.utc),
        })

    def list_events(self, limit: int = 100) -> list[dict[str, Any]]:
        limit = max(1, min(limit, 500))
        return list(self.events.find({}, {"_id": 0}).sort("created_at", -1).limit(limit))


class InMemoryAuditSink(AuditSink):
    """Para tests y fallback si Mongo no está disponible."""

    def __init__(self) -> None:
        self._events: list[dict[str, Any]] = []

    def record(self, action: str, subject: str | None, detail: str = "") -> None:
        self._events.append({
            "action": action,
            "subject": subject,
            "detail": detail,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    def list_events(self, limit: int = 100) -> list[dict[str, Any]]:
        return list(reversed(self._events[-limit:]))
