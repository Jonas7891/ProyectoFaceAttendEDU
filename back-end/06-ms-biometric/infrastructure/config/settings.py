"""Typed configuration read from the environment (pydantic-settings).

Environment contract:

* ``MONGODB_URL`` — set by `back-end/docker-compose.yml` for `ms-biometric`
  (also accepted as ``BIOMETRIC_MONGODB_URL``).
* Everything else is optional and takes the ``BIOMETRIC_`` prefix, e.g.
  ``BIOMETRIC_FACIAL_COLLECTION``.

Collection names default to the canonical document model in
fae-docs/06-data/domains/06-biometric.md (``facial_embeddings``,
``fingerprint_embeddings``), which DATA_MODEL.md names as the authoritative
source for this service.
"""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _load_root_env() -> None:
    """Merge the repo-root ``.env`` into the process environment (dev runs).

    Docker compose injects the environment directly and no ``.env`` ships
    inside the image, so this is a no-op in containers. Existing variables
    are never overwritten.
    """
    env_file = next(
        (
            base / ".env"
            for base in Path(__file__).resolve().parents
            if (base / ".env").is_file()
        ),
        None,
    )
    if env_file is None:
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


_load_root_env()

_MONGO_USER = os.getenv("MONGO_USER", "mongoadmin")
_MONGO_PASSWORD = os.getenv("MONGO_PASSWORD", "mongopass")
DEFAULT_MONGODB_URL = (
    f"mongodb://{_MONGO_USER}:{_MONGO_PASSWORD}"
    "@localhost:27017/faceattend_biometric?authSource=admin"
)
DEFAULT_MONGO_DB_NAME = "faceattend_biometric"
SECONDS_PER_DAY = 86_400


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="BIOMETRIC_", extra="ignore")

    # ── Connection ─────────────────────────────────────────────────────
    mongo_enabled: bool = True
    mongodb_url: str = Field(
        default=DEFAULT_MONGODB_URL,
        validation_alias=AliasChoices("BIOMETRIC_MONGODB_URL", "MONGODB_URL"),
    )
    mongo_db_name: str = DEFAULT_MONGO_DB_NAME
    server_selection_timeout_ms: int = 3_000

    # ── Health probes ──────────────────────────────────────────────────
    health_ping_timeout_seconds: float = 2.0
    health_cache_seconds: float = 5.0

    # ── Collections ────────────────────────────────────────────────────
    facial_collection: str = "facial_embeddings"
    fingerprint_collection: str = "fingerprint_embeddings"
    update_case_collection: str = "biometric_update_cases"
    match_log_collection: str = "biometric_match_logs"

    # ── Retention & matching ───────────────────────────────────────────
    match_log_retention_days: int = 90
    similarity_threshold: float = 0.85
    # Upper bound for the 1:N identify scan. Reaching it is logged as a warning:
    # it means candidates were not considered, so it must never pass silently.
    identify_scan_limit: int = 10_000

    @property
    def match_log_ttl_seconds(self) -> int:
        return self.match_log_retention_days * SECONDS_PER_DAY


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Process-wide settings. Cached; tests call `get_settings.cache_clear()`."""
    return Settings()
