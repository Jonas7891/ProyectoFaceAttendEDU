"""DDL e índices canónicos de identidad (PostgreSQL) y biometría (MongoDB).

Única fuente de verdad: la usan `PostgresUserRepository`,
`MongoDBBiometricRepository` y `scripts/seed_users.py`.
Cambiar el esquema aquí lo propaga a los tres sin divergencias.
"""
from __future__ import annotations

from typing import Any

IDENTITY_DDL = """
CREATE TABLE IF NOT EXISTS person (
    person_id BIGSERIAL PRIMARY KEY,
    document_number VARCHAR(80) UNIQUE,
    name VARCHAR(150),
    last_name VARCHAR(150),
    email VARCHAR(254),
    phone VARCHAR(40),
    status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS app_user (
    user_id BIGSERIAL PRIMARY KEY,
    person_id BIGINT NOT NULL UNIQUE REFERENCES person(person_id),
    username VARCHAR(150) NOT NULL UNIQUE,
    authentication_type VARCHAR(40) NOT NULL DEFAULT 'biometric',
    status BOOLEAN NOT NULL DEFAULT TRUE,
    last_access TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_person_status_id
    ON person (status, person_id);
CREATE INDEX IF NOT EXISTS idx_person_email
    ON person (email);
CREATE INDEX IF NOT EXISTS idx_app_user_status_username
    ON app_user (status, username);
CREATE INDEX IF NOT EXISTS idx_app_user_person_status
    ON app_user (person_id, status);
"""


def ensure_postgres_identity(connection: Any) -> None:
    """Crea tablas/índices de identidad de forma idempotente."""
    connection.execute(IDENTITY_DDL)


def ensure_mongo_biometric_indexes(database: Any) -> None:
    """Índices de colecciones biométricas (idempotente)."""
    from pymongo import ASCENDING, DESCENDING

    database.face_samples.create_index([("person_id", ASCENDING)], unique=True)
    database.face_samples.create_index([("updated_at", DESCENDING)], name="idx_face_samples_updated_at")
    database.fingerprint_samples.create_index([("person_id", ASCENDING)])
    database.fingerprint_samples.create_index([("created_at", DESCENDING)], name="idx_fingerprint_samples_created_at")
    database.fingerprint_samples.create_index([("id", ASCENDING)], unique=True)
