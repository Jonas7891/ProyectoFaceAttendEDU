"""Dependencias con inicialización perezosa (evita singletons en import time).

Los objetos globales se crean en `initialize_dependencies()` para que los
tests puedan importar el módulo sin abrir conexiones reales.
"""
from __future__ import annotations

from fastapi import Depends, HTTPException, Request

from ...application.ports.in_.user_queries import UserQueriesPort
from ...application.use_cases.lifecycle import DeleteBiometricData, RevokeBiometricTemplate
from ...application.use_cases.login_face import LoginFace
from ...application.use_cases.login_fingerprint import LoginFingerprint
from ...application.use_cases.register_face import RegisterFace
from ...application.use_cases.register_fingerprint import RegisterFingerprint
from ...application.use_cases.user_queries import UserQueries
from ..persistence.biometric_user_repository import BiometricUserRepository
from ..persistence.mongodb_biometric_repository import MongoDBBiometricRepository
from ..persistence.postgres_user_repository import PostgresUserRepository
from ..security.audit import MongoAuditSink
from ..security.rate_limit import RateLimiter
from .settings import settings

_state: dict = {}


def _ensure() -> dict:
    if "repository" not in _state:
        from pymongo import MongoClient

        from ..biometrics.opencv_biometric_service import OpenCVBiometricService

        mongo_client = MongoClient(settings.mongo_url, serverSelectionTimeoutMS=5000)
        database = mongo_client[settings.mongo_db]
        _state.update({
            "mongo_client": mongo_client,
            "database": database,
            "biometric_service": OpenCVBiometricService(),
            "repository": BiometricUserRepository(
                PostgresUserRepository(settings.postgres_url),
                MongoDBBiometricRepository(database),
            ),
            "audit": MongoAuditSink(database),
            "rate_limiter": RateLimiter(
                settings.rate_limit_max_attempts, settings.rate_limit_window_seconds
            ),
        })
    return _state


def initialize_dependencies() -> None:
    st = _ensure()
    st["mongo_client"].admin.command("ping")
    st["repository"].postgres.initialize()
    st["repository"].initialize()


def close_dependencies() -> None:
    if "mongo_client" in _state:
        _state["mongo_client"].close()


def database_is_ready() -> bool:
    try:
        from pymongo.errors import PyMongoError

        st = _ensure()
        st["mongo_client"].admin.command("ping")
        return True
    except Exception:
        return False


def get_biometric_service():
    from ..biometrics.opencv_biometric_service import OpenCVBiometricService

    return _ensure()["biometric_service"]


def get_repository() -> BiometricUserRepository:
    return _ensure()["repository"]


def get_user_queries(repository=Depends(get_repository)) -> UserQueriesPort:
    return UserQueries(repository)


def get_audit_sink():
    return _ensure()["audit"]


def get_session_service():
    """Singleton perezoso del SessionService (misma instancia por proceso)."""
    from ..web.session_service import SessionService

    return _ensure().setdefault("sessions", SessionService())


def get_rate_limiter() -> RateLimiter:
    return _ensure()["rate_limiter"]


def rate_limit(key_prefix: str):
    """Dependencia fabrica: limita por IP + prefijo. 429 si excede."""

    def _dep(request: Request, limiter: RateLimiter = Depends(get_rate_limiter)) -> None:
        client = request.client.host if request.client else "unknown"
        forwarded = request.headers.get("x-forwarded-for", "") if settings.trust_proxy_headers else ""
        if forwarded.strip():
            client = forwarded.split(",")[-1].strip() or client
        allowed, _ = limiter.check(f"{key_prefix}:{client}")
        if not allowed:
            raise HTTPException(status_code=429, detail="Demasiadas solicitudes, intenta más tarde")

    return _dep


def get_register_face(repository=Depends(get_repository)) -> RegisterFace:
    return RegisterFace(repository, get_biometric_service(), settings.match_threshold)


def get_login_face(repository=Depends(get_repository)) -> LoginFace:
    return LoginFace(repository, get_biometric_service(), settings.match_threshold)


def get_register_fingerprint(repository=Depends(get_repository)) -> RegisterFingerprint:
    return RegisterFingerprint(repository, get_biometric_service(), settings.fingerprint_match_threshold)


def get_login_fingerprint(repository=Depends(get_repository)) -> LoginFingerprint:
    return LoginFingerprint(repository, get_biometric_service(), settings.fingerprint_match_threshold)


def get_revoke_template(repository=Depends(get_repository), audit=Depends(get_audit_sink)) -> RevokeBiometricTemplate:
    return RevokeBiometricTemplate(repository, audit)


def get_delete_data(repository=Depends(get_repository), audit=Depends(get_audit_sink)) -> DeleteBiometricData:
    return DeleteBiometricData(repository, audit)


# Backwards-compat: algunos routers importan estos nombres a nivel de módulo.
# Se dejan en None hasta initialize_dependencies(); los routers deben usar Depends().
mongo_client = database = biometric_service = postgres_repository = mongo_repository = repository = None
