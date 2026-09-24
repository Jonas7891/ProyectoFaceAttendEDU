"""FastAPI dependency wiring (composition root for the driven side).

Every router receives its repositories through `Depends`, so a test can replace
any of them with `app.dependency_overrides[...]` — no production singleton and
no in-memory fallback lives in this module.
"""
from __future__ import annotations

from fastapi import Depends, Request

from domain.ports.out.biometric_repository import BiometricRepositoryPort
from domain.ports.out.match_log_repository import MatchLogRepositoryPort
from domain.ports.out.update_case_repository import UpdateCaseRepositoryPort
from domain.value_objects.biometric_type import BiometricType
from infrastructure.config.settings import Settings, get_settings
from infrastructure.persistence.errors import PersistenceUnavailableError
from infrastructure.persistence.mongo_client import MongoClient
from infrastructure.persistence.mongo_embedding_repository import MongoEmbeddingRepository
from infrastructure.persistence.mongo_match_log_repository import MongoMatchLogRepository
from infrastructure.persistence.mongo_update_case_repository import MongoUpdateCaseRepository


def get_mongo_client(request: Request) -> MongoClient:
    """The process-wide client published by `main.py`'s lifespan."""
    client = getattr(request.app.state, "mongo_client", None)
    if client is None:
        raise PersistenceUnavailableError(
            "MongoDB client was never initialised; the service did not start correctly"
        )
    return client


def get_facial_repository(
    client: MongoClient = Depends(get_mongo_client),
    settings: Settings = Depends(get_settings),
) -> BiometricRepositoryPort:
    return MongoEmbeddingRepository(client, settings, BiometricType.FACIAL)


def get_fingerprint_repository(
    client: MongoClient = Depends(get_mongo_client),
    settings: Settings = Depends(get_settings),
) -> BiometricRepositoryPort:
    return MongoEmbeddingRepository(client, settings, BiometricType.FINGERPRINT)


def get_update_case_repository(
    client: MongoClient = Depends(get_mongo_client),
    settings: Settings = Depends(get_settings),
) -> UpdateCaseRepositoryPort:
    return MongoUpdateCaseRepository(client, settings)


def get_match_log_repository(
    client: MongoClient = Depends(get_mongo_client),
    settings: Settings = Depends(get_settings),
) -> MatchLogRepositoryPort:
    return MongoMatchLogRepository(client, settings)


def get_similarity_threshold(settings: Settings = Depends(get_settings)) -> float:
    """Cosine score at or above which a comparison counts as a match."""
    return settings.similarity_threshold
