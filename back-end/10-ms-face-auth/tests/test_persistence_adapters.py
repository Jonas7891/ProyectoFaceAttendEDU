from types import SimpleNamespace

from face_auth.domain.entities.biometric_sample import BiometricSample
from face_auth.infrastructure.persistence.mongodb_biometric_repository import MongoDBBiometricRepository


class FakeCollection:
    def __init__(self) -> None:
        self.documents = []

    def insert_one(self, document: dict) -> None:
        self.documents.append(document.copy())

    def find_one(self, query: dict) -> dict | None:
        return next((document.copy() for document in self.documents if all(document.get(k) == v for k, v in query.items())), None)


def test_fingerprint_sample_is_written_to_mongodb_adapter():
    fingerprints = FakeCollection()
    database = SimpleNamespace(
        face_samples=FakeCollection(),
        fingerprint_samples=fingerprints,
        counters=FakeCollection(),
    )
    repository = MongoDBBiometricRepository(database)

    saved = repository.save_sample(BiometricSample(17, 42, 2, "encoded-sample", 91, None))

    assert len(fingerprints.documents) == 1
    assert fingerprints.documents[0]["person_id"] == 42
    assert fingerprints.documents[0]["data_base64"] == "encoded-sample"
    assert saved.id == 17
    assert saved.user_id == 42
