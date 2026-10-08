import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from ....application.ports.in_.user_queries import UserQueriesPort
from ....application.use_cases.login_face import LoginFace
from ....application.use_cases.login_fingerprint import LoginFingerprint
from ....application.use_cases.register_face import RegisterFace
from ....application.use_cases.register_fingerprint import RegisterFingerprint
from ....application.ports.out.biometric_service import BiometricService
from ...config.dependencies import (
    database_is_ready,
    get_audit_sink,
    get_biometric_service,
    get_login_face,
    get_login_fingerprint,
    get_register_face,
    get_register_fingerprint,
    get_session_service,
    get_user_queries,
    rate_limit,
)
from ....domain.exceptions import DuplicateUserError
from ....domain.value_objects import AuditAction
from ...config.settings import settings
from ...observability.middleware import inc
from ..auth import active_session_usernames, advance_liveness_challenge, consume_liveness_challenge, create_access_token, create_liveness_challenge, verify_liveness_challenge
from ..schemas.auth_schema import (
    LoginFaceRequest,
    LoginFingerprintSampleRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterFaceRequest,
    RegisterFingerprintSampleRequest,
    LivenessStepRequest,
)

router = APIRouter()
logger = logging.getLogger(__name__)


def _audit(audit, action: AuditAction, subject: str | None, detail: str = "") -> None:
    """Escritura best-effort: la auditoría jamás bloquea el camino feliz."""
    try:
        audit.record(action.value, subject, detail)
    except Exception:
        logger.debug("audit write failed action=%s", action.value)


def _auth_failure(audit, modality: str) -> None:
    inc("biometric_match_failure_total")
    _audit(audit, AuditAction.VERIFY_FAILURE, None, modality)


def _auth_success(audit, username: str, modality: str) -> None:
    inc("biometric_verification_total")
    inc("biometric_match_success_total")
    _audit(audit, AuditAction.VERIFY_SUCCESS, username, modality)


@router.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/api/ready")
def readiness() -> dict[str, str]:
    if not database_is_ready():
        raise HTTPException(status_code=503, detail="La base de datos no está disponible")
    return {"status": "ready"}


@router.get("/api/face/liveness-challenge")
def liveness_challenge(actions: int = Query(default=3, ge=2, le=3)) -> dict[str, object]:
    """`actions=3` (defecto, registro) o `actions=2` (login rápido)."""
    try:
        token, actions_list = create_liveness_challenge(actions)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"challenge_token": token, "actions": actions_list}


@router.post("/api/face/liveness-step", dependencies=[Depends(rate_limit("liveness_step"))])
def liveness_step(payload: LivenessStepRequest, biometric_service: BiometricService = Depends(get_biometric_service)) -> dict[str, object]:
    try:
        actions, current_step = verify_liveness_challenge(payload.challenge_token)
        if current_step != payload.action_index:
            raise ValueError("El paso de prueba de vida no es válido")
        images = [biometric_service.decode_image(image) for image in payload.images]
        if not biometric_service.validate_liveness(images, [actions[current_step]]):
            raise PermissionError(f"No se completó el gesto solicitado: {actions[current_step]}")
        next_token, _, next_step = advance_liveness_challenge(payload.challenge_token)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    return {"challenge_token": next_token, "completed": next_step == len(actions)}


@router.get("/api/users/{username}/exists")
def user_exists(username: str, queries: UserQueriesPort = Depends(get_user_queries)) -> dict:
    return queries.exists(username)


@router.post("/api/register/face", dependencies=[Depends(rate_limit("register_face"))])
def register_face(payload: RegisterFaceRequest, use_case: RegisterFace = Depends(get_register_face), biometric_service: BiometricService = Depends(get_biometric_service)) -> dict:
    try:
        username = payload.username.strip()
        existed = use_case.repository.get_by_username(username) is not None
        verify_liveness_challenge(payload.challenge_token, require_complete=True)
        use_case.execute(payload.username, biometric_service.decode_image(payload.image), liveness_verified=True)
        consume_liveness_challenge(payload.challenge_token)
    except DuplicateUserError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    message = f"Rostro actualizado para: {username}" if existed else f"Usuario creado con rostro: {username}"
    logger.info("Face registration completed username=%s existed=%s", username, existed)
    return {"ok": True, "message": message, "username": username}


@router.post("/api/register/fingerprint-sample", dependencies=[Depends(rate_limit("register_fp"))])
def register_fingerprint_sample(payload: RegisterFingerprintSampleRequest, use_case: RegisterFingerprint = Depends(get_register_fingerprint)) -> dict:
    try:
        sample = use_case.execute(payload.username, payload.sample_format, payload.data_base64, payload.quality)
    except DuplicateUserError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    username = payload.username.strip()
    return {"ok": True, "message": f"Muestra de huella registrada para: {username}", "id": sample.id}


@router.post("/api/login/fingerprint-sample", dependencies=[Depends(rate_limit("login_fp"))])
def login_fingerprint_sample(payload: LoginFingerprintSampleRequest, use_case: LoginFingerprint = Depends(get_login_fingerprint), biometric_service: BiometricService = Depends(get_biometric_service), audit=Depends(get_audit_sink)) -> dict:
    if not payload.data_base64:
        raise HTTPException(status_code=400, detail="La muestra de huella es requerida")
    try:
        username, score = use_case.execute(biometric_service.decode_fingerprint(payload.data_base64))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except PermissionError as exc:
        logger.warning("Fingerprint authentication failed")
        _auth_failure(audit, "fingerprint")
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    logger.info("Fingerprint authentication succeeded username=%s", username)
    _auth_success(audit, username, "fingerprint")
    access_token, expires_in = create_access_token(username)
    response = {"ok": True, "username": username, "score": score, "access_token": access_token, "token_type": "bearer", "expires_in": expires_in, "message": f"Huella reconocida: {username}."}
    if settings.session_v2_enabled:
        # Aditivo: claves nuevas que los clientes legacy ignoran.
        session = get_session_service().create_session(username)
        response.update({"refresh_token": session["refresh_token"], "session_id": session["session_id"]})
    return response


@router.post("/api/login/face", dependencies=[Depends(rate_limit("login_face"))])
def login_face(payload: LoginFaceRequest, use_case: LoginFace = Depends(get_login_face), biometric_service: BiometricService = Depends(get_biometric_service), audit=Depends(get_audit_sink)) -> dict:
    try:
        verify_liveness_challenge(payload.challenge_token, require_complete=True)
        username, distance = use_case.execute(biometric_service.decode_image(payload.image), liveness_verified=True)
        consume_liveness_challenge(payload.challenge_token)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except PermissionError as exc:
        logger.warning("Face authentication failed")
        _auth_failure(audit, "face")
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    logger.info("Face authentication succeeded username=%s distance=%.4f", username, distance)
    _auth_success(audit, username, "face")
    access_token, expires_in = create_access_token(username)
    response = {"ok": True, "username": username, "distance": distance, "access_token": access_token, "token_type": "bearer", "expires_in": expires_in}
    if settings.session_v2_enabled:
        # Aditivo: claves nuevas que los clientes legacy ignoran.
        session = get_session_service().create_session(username)
        response.update({"refresh_token": session["refresh_token"], "session_id": session["session_id"]})
    return response


@router.post("/api/auth/refresh", dependencies=[Depends(rate_limit("auth_refresh"))])
def refresh_session(payload: RefreshRequest, audit=Depends(get_audit_sink)) -> dict:
    """Rota el refresh token. Un solo uso: el reuso revoca la familia (anti-robo)."""
    try:
        session = get_session_service().refresh(payload.refresh_token)
    except ValueError as exc:
        _audit(audit, AuditAction.TOKEN_REFRESH_FAILURE, None, "refresh")
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    _audit(audit, AuditAction.TOKEN_REFRESH, None, "refresh")
    return {"ok": True, "access_token": session["access_token"], "refresh_token": session["refresh_token"], "session_id": session["session_id"], "token_type": "bearer", "expires_in": session["expires_in"]}


@router.post("/api/auth/logout")
def logout(payload: LogoutRequest, audit=Depends(get_audit_sink)) -> dict:
    """Revoca la familia de refresh server-side. Idempotente (siempre 200)."""
    get_session_service().logout(payload.refresh_token, payload.session_id)
    _audit(audit, AuditAction.LOGOUT, None, "logout")
    return {"ok": True}


@router.get("/api/auth/me")
def auth_me(request: Request, audit=Depends(get_audit_sink)) -> dict:
    """Perfil mínimo post-login (lazy): valida Bearer y devuelve sub+sid."""
    authorization = request.headers.get("authorization", "")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="No autorizado")
    try:
        payload = get_session_service().verify_access_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    return {"username": payload["sub"], "session_id": payload.get("sid")}


@router.get("/api/users")
def list_users(queries: UserQueriesPort = Depends(get_user_queries)) -> list[dict]:
    return queries.list_users()


@router.get("/api/users/active")
def list_active_users(queries: UserQueriesPort = Depends(get_user_queries)) -> list[dict]:
    return queries.list_active_users(set(active_session_usernames()))