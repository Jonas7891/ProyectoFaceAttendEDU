from datetime import datetime, timezone
from typing import Any

from pymongo import ASCENDING, ReturnDocument
from pymongo.database import Database

from ...domain.entities.biometric_sample import BiometricSample
from .schema import ensure_mongo_biometric_indexes


class MongoDBBiometricRepository:
    def __init__(self, database: Database) -> None:
        self.database = database
        self.faces = database.face_samples
        self.fingerprints = database.fingerprint_samples
        self.counters = database.counters

    def initialize(self) -> None:
        ensure_mongo_biometric_indexes(self.database)

    def face_encoding(self, person_id: int) -> str | None:
        record = self.faces.find_one({"person_id": person_id}, {"encoding": 1})
        return record.get("encoding") if record else None

    def save_face(self, person_id: int, encoding: str) -> None:
        self.faces.update_one(
            {"person_id": person_id},
            {"$set": {"encoding": encoding, "updated_at": datetime.now(timezone.utc)}},
            upsert=True,
        )

    def has_fingerprint(self, person_id: int) -> bool:
        return self.fingerprints.find_one({"person_id": person_id}, {"_id": 1}) is not None

    def save_sample(self, sample: BiometricSample) -> BiometricSample:
        sample_id = sample.id or self._next_id("fingerprint_samples")
        created_at = sample.created_at or datetime.now(timezone.utc)
        self.fingerprints.insert_one({
            "id": sample_id,
            "person_id": sample.user_id,
            "sample_format": sample.sample_format,
            "data_base64": sample.data_base64,
            "quality": sample.quality,
            "created_at": created_at,
        })
        return self._sample(self.fingerprints.find_one({"id": sample_id}))

    def list_samples(self) -> list[BiometricSample]:
        return [self._sample(record) for record in self.fingerprints.find().sort("id", ASCENDING)]

    def revoke_face(self, person_id: int) -> None:
        """Revocación: borra el encoding pero conserva marcador auditable."""
        self.faces.delete_one({"person_id": person_id})
        self.faces.insert_one({
            "person_id": person_id,
            "encoding": None,
            "revoked": True,
            "updated_at": datetime.now(timezone.utc),
        })

    def delete_biometrics(self, person_id: int) -> None:
        """Borrado efectivo de plantillas y muestras (sin identidad)."""
        self.faces.delete_many({"person_id": person_id})
        self.fingerprints.delete_many({"person_id": person_id})

    def _next_id(self, collection_name: str) -> int:
        counter = self.counters.find_one_and_update(
            {"_id": collection_name}, {"$inc": {"value": 1}}, upsert=True, return_document=ReturnDocument.AFTER
        )
        return counter["value"]

    @staticmethod
    def _sample(record: dict[str, Any] | None) -> BiometricSample:
        if record is None:
            raise RuntimeError("La muestra no pudo guardarse")
        return BiometricSample(record["id"], record["person_id"], record.get("sample_format"), record["data_base64"], record.get("quality"), record.get("created_at"))