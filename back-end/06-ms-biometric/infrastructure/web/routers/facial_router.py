"""Facial biometric endpoints (primary adapter).

Route prefix is fixed at `/api/v1/biometric/facial` because the API gateway
(`back-end/99-api-gateway/kong/kong.yml`, route `biometric-route`) forwards
`/api/v1/biometric` to this service with `strip_path: false`, and
`front-end/Web/src/api/endpoints.ts` calls the full prefixed path.

Liveness + image-based enroll/identify (`/liveness-challenge`, `/liveness-step`,
`/enroll-image`, `/identify-image`) were ported from `10-ms-face-auth` (merged
and removed): that service computed encodings from raw images itself; this
router is what gives `06-ms-biometric` the same capability, feeding straight
into the existing vector-based `enroll`/`identify` storage and matching so
there is exactly one facial template model, not two. Deliberately placed under
this prefix rather than the source's bare `/api/face/...` — there is no
separate face-auth path anymore.
"""
from __future__ import annotations

import logging
import time

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field

from application.facial_services import (
    CallContext,
    FaceAlreadyEnrolled,
    FaceTemplateService,
    IdentifyFaceService,
    NoActiveTemplate,
    NoMatch,
    VerifyFaceService,
)
from application.match_audit import record_match
from domain.entities.match_log import BiometricMatchLog
from domain.face_encoding import decode_image, face_encoding, liveness_report, validate_liveness
from domain.ports.out.biometric_repository import BiometricRepositoryPort
from domain.ports.out.match_log_repository import MatchLogRepositoryPort
from domain.similarity import cosine
from domain.value_objects.biometric_type import BiometricType
from infrastructure.config.dependencies import (
    get_facial_repository,
    get_liveness_secret,
    get_match_log_repository,
    get_face_match_threshold,
    rate_limit,
)
from infrastructure.config.settings import Settings, get_settings
from infrastructure.web.liveness import (
    advance_liveness_challenge,
    consume_liveness_challenge,
    create_liveness_challenge,
    forget_identity,
    liveness_claims,
    reference_identity,
    remember_identity,
    verify_liveness_challenge,
)
from infrastructure.web.match_scope import MatchScope, get_match_scope
from infrastructure.web.security import (
    STAFF_PERMISSION,
    bearer_or_none,
    ensure_biometric_consent,
    ensure_can_enroll,
    ensure_staff_scope,
    require_permission,
)
from infrastructure.web.schemas.responses import template_response

logger = logging.getLogger(__name__)

# Templates are sensitive: only roles that capture attendance (admin, instructor).
# Every role may pass liveness and enroll its own face (checked in /enroll-image).
router = APIRouter(prefix="/api/v1/biometric/facial", tags=["facial"])
STAFF = Depends(require_permission(STAFF_PERMISSION))
ANY_ROLE = Depends(require_permission("biometric.case:request"))

OPERATION_LIVENESS_FAILURE = "LIVENESS_FAILURE"
NO_ACTIVE_TEMPLATE = "no active facial template"
NO_MATCH = "no match found"
FACE_ALREADY_ENROLLED = "This face is already enrolled for a different person"
FRAMES_PER_ACTION = 6


def _liveness_failure_reason(images, action: str) -> str:
    """Why a gesture was refused, for the log only (numbers, never face data)."""
    try:
        return liveness_report(images, action).reason
    except Exception:  # noqa: BLE001 - diagnostics must never turn a 400 into a 500
        return "reason unavailable"


def _actor_user_id(request: Request | None) -> str | None:
    """The authenticated user who made the call (audit: who enrolled a face)."""
    return str(getattr(getattr(request, "state", None), "user_id", "") or "") or None


def _correlation_id(request: Request) -> str | None:
    return getattr(request.state, "correlation_id", None)


class EnrollFacialRequest(BaseModel):
    person_id: str = Field(min_length=1)
    encoding: list[float] = Field(min_length=1)
    model_version: str = "facenet-v1"


class VerifyFacialRequest(BaseModel):
    person_id: str = Field(min_length=1)
    encoding: list[float] = Field(min_length=1)


class IdentifyFacialRequest(BaseModel):
    encoding: list[float] = Field(min_length=1)


class LivenessStepRequest(BaseModel):
    challenge_token: str = Field(min_length=1)
    action_index: int = Field(ge=0)
    images: list[str] = Field(min_length=FRAMES_PER_ACTION, max_length=FRAMES_PER_ACTION)


class EnrollFacialImageRequest(BaseModel):
    person_id: str = Field(min_length=1)
    image_base64: str = Field(min_length=1)
    challenge_token: str = Field(min_length=1)
    model_version: str = "facenet-v1"


class IdentifyFacialImageRequest(BaseModel):
    image_base64: str = Field(min_length=1)
    challenge_token: str = Field(min_length=1)


def _context(request: Request | None, with_actor: bool = False) -> CallContext:
    if request is None:
        return CallContext()
    return CallContext(_correlation_id(request), _actor_user_id(request) if with_actor else None)


def _templates(repository: BiometricRepositoryPort, match_logs: MatchLogRepositoryPort | None) -> FaceTemplateService:
    return FaceTemplateService(repository, match_logs)


@router.post("/enroll", status_code=status.HTTP_201_CREATED, dependencies=[STAFF])
async def enroll_facial(
    req: EnrollFacialRequest,
    repository: BiometricRepositoryPort = Depends(get_facial_repository),
    match_logs: MatchLogRepositoryPort = Depends(get_match_log_repository),
    request: Request = None,
):
    # REST only: the WebSocket channel checks the authorization itself before calling this.
    if request is not None:
        await ensure_biometric_consent(req.person_id, bearer_or_none(request))
    stored = await _templates(repository, match_logs).enroll(
        req.person_id, req.encoding, req.model_version, _context(request, with_actor=True)
    )
    return template_response(stored)


@router.get("/liveness-challenge", dependencies=[ANY_ROLE])
async def liveness_challenge(
    actions: int = 3,
    supported: str | None = None,
    secret: str = Depends(get_liveness_secret),
    settings: Settings = Depends(get_settings),
):
    if actions not in (1, 2, 3):
        raise HTTPException(status_code=422, detail="actions must be 1, 2 or 3")
    # `supported`: comma-separated gestures the client can render. Without it the
    # client is an older build and only gets the original gestures.
    allowed = [name.strip() for name in supported.split(",") if name.strip()] if supported else None
    try:
        token, action_list = create_liveness_challenge(
            secret, settings.liveness_ttl_seconds, actions, allowed
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return {"challenge_token": token, "actions": action_list}


# Literal routes (liveness-challenge above) MUST be registered before
# /{person_id}: FastAPI matches path operations in declaration order, and a
# GET /{person_id} declared first would swallow GET /liveness-challenge,
# treating "liveness-challenge" as a person_id. Confirmed by actually hitting
# this 404 in a real test run before reordering.
@router.get("/{person_id}", dependencies=[STAFF])
async def get_facial(
    person_id: str,
    request: Request,
    repository: BiometricRepositoryPort = Depends(get_facial_repository),
):
    await ensure_staff_scope(request, person_id)
    try:
        return template_response(await _templates(repository, None).active(person_id))
    except NoActiveTemplate as exc:
        raise HTTPException(status_code=404, detail=NO_ACTIVE_TEMPLATE) from exc


@router.get("/{person_id}/history", dependencies=[STAFF])
async def facial_history(
    person_id: str,
    request: Request,
    repository: BiometricRepositoryPort = Depends(get_facial_repository),
):
    await ensure_staff_scope(request, person_id)
    history = await _templates(repository, None).history(person_id)
    return {"history": [template_response(template) for template in history]}


@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[STAFF])
async def delete_facial(
    person_id: str,
    request: Request,
    repository: BiometricRepositoryPort = Depends(get_facial_repository),
    match_logs: MatchLogRepositoryPort = Depends(get_match_log_repository),
):
    await ensure_staff_scope(request, person_id)
    # Covers both "revoke template" and "delete subject" from the merged 10-ms-face-auth
    # lifecycle endpoints: both collapse onto this one soft-deactivate.
    try:
        await _templates(repository, match_logs).remove(person_id, _context(request))
    except NoActiveTemplate as exc:
        raise HTTPException(status_code=404, detail=NO_ACTIVE_TEMPLATE) from exc
    return None


@router.post("/verify", dependencies=[STAFF])
async def verify_facial(
    req: VerifyFacialRequest,
    request: Request,
    repository: BiometricRepositoryPort = Depends(get_facial_repository),
    match_logs: MatchLogRepositoryPort = Depends(get_match_log_repository),
    threshold: float = Depends(get_face_match_threshold),
    match_scope: MatchScope = Depends(get_match_scope),
):
    try:
        matched, score = await VerifyFaceService(repository, match_logs).verify(
            req.person_id, req.encoding, threshold, match_scope, _context(request)
        )
    except NoActiveTemplate as exc:
        raise HTTPException(status_code=404, detail=NO_ACTIVE_TEMPLATE) from exc
    return {"match": matched, "score": score}


async def _identify(encoding, request, repository, match_logs, threshold, match_scope):
    try:
        person_id, score = await IdentifyFaceService(repository, match_logs).identify(
            encoding, threshold, match_scope, _context(request)
        )
    except NoMatch as exc:
        raise HTTPException(status_code=404, detail=NO_MATCH) from exc
    return {"person_id": person_id, "score": score}


@router.post("/identify", dependencies=[STAFF])
async def identify_facial(
    req: IdentifyFacialRequest,
    request: Request,
    repository: BiometricRepositoryPort = Depends(get_facial_repository),
    match_logs: MatchLogRepositoryPort = Depends(get_match_log_repository),
    threshold: float = Depends(get_face_match_threshold),
    match_scope: MatchScope = Depends(get_match_scope),
):
    return await _identify(req.encoding, request, repository, match_logs, threshold, match_scope)


IDENTITY_CHANGED = "The face changed during the liveness check"


def _check_step_identity(first_frame, challenge_id: str | None, settings: Settings) -> None:
    """The first frame of every step must be the person seen at the first step.

    Skipped when the token carries no challenge id or the reference is gone
    (another worker or an expired TTL): the check only ever adds a refusal.
    """
    if challenge_id is None:
        return
    encoding = face_encoding(first_frame)
    if encoding is None:
        raise ValueError("No face found in the image")
    reference = reference_identity(challenge_id)
    if reference is None:
        remember_identity(challenge_id, encoding, settings.liveness_ttl_seconds)
    elif cosine(encoding, reference) < settings.liveness_identity_threshold:
        raise ValueError(IDENTITY_CHANGED)


def _check_final_identity(secret: str, token: str, encoding: list[float], settings: Settings) -> None:
    if not settings.liveness_identity_check:
        return
    challenge_id, _ = liveness_claims(secret, token)
    reference = reference_identity(challenge_id)
    forget_identity(challenge_id)
    if reference is not None and cosine(encoding, reference) < settings.liveness_identity_threshold:
        raise ValueError(IDENTITY_CHANGED)


@router.post("/liveness-step", dependencies=[ANY_ROLE, Depends(rate_limit("liveness_step"))])
async def liveness_step(
    req: LivenessStepRequest,
    request: Request,
    secret: str = Depends(get_liveness_secret),
    settings: Settings = Depends(get_settings),
    match_logs: MatchLogRepositoryPort = Depends(get_match_log_repository),
):
    try:
        actions, step = verify_liveness_challenge(secret, req.challenge_token)
        if req.action_index != step:
            raise ValueError("action_index does not match the current challenge step")
        challenge_id, issued_at = liveness_claims(secret, req.challenge_token)
        if issued_at is not None and time.time() - issued_at < settings.liveness_min_step_seconds:
            raise ValueError("Liveness gesture completed too fast")
        images = [
            decode_image(image, settings.max_image_bytes, settings.max_image_pixels)
            for image in req.images
        ]
        completed_gesture = validate_liveness(images, actions[req.action_index])
        if completed_gesture and settings.liveness_identity_check:
            _check_step_identity(images[0], challenge_id, settings)
    except (ValueError, IndexError) as exc:
        logger.warning("liveness-step refused: %s", exc)
        await record_match(
            match_logs,
            BiometricMatchLog(
                biometric_type=BiometricType.FACIAL,
                operation=OPERATION_LIVENESS_FAILURE,
                matched=False,
                score=0.0,
                threshold=0.0,
                correlation_id=_correlation_id(request),
            ),
        )
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not completed_gesture:
        await record_match(
            match_logs,
            BiometricMatchLog(
                biometric_type=BiometricType.FACIAL,
                operation=OPERATION_LIVENESS_FAILURE,
                matched=False,
                score=0.0,
                threshold=0.0,
                correlation_id=_correlation_id(request),
            ),
        )
        logger.info(
            "liveness-step refused: gesture %s not detected (%s)",
            actions[req.action_index],
            _liveness_failure_reason(images, actions[req.action_index]),
        )
        # Not an error: a kiosk idling in front of nobody asks for this over and over,
        # and a 4xx per attempt floods the browser console. The step does not advance
        # (same token) and the client counts it as a failed attempt.
        return {"challenge_token": req.challenge_token, "completed": False, "detected": False}
    try:
        next_token, _, next_step = advance_liveness_challenge(
            secret, settings.liveness_ttl_seconds, req.challenge_token
        )
    except ValueError as exc:
        # Genuine replay of an already-advanced token (not just a validation
        # failure above) — still a 400, never an unhandled 500.
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"challenge_token": next_token, "completed": next_step >= len(actions), "detected": True}


def _encoding_after_liveness(secret: str, token: str, image_base64: str, settings: Settings) -> list[float]:
    """Consumes the liveness challenge and returns the face of the image (400 otherwise)."""
    try:
        consume_liveness_challenge(secret, token)
        image = decode_image(image_base64, settings.max_image_bytes, settings.max_image_pixels)
        encoding = face_encoding(image)
        if encoding is not None:
            _check_final_identity(secret, token, encoding, settings)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if encoding is None:
        raise HTTPException(status_code=400, detail="No face found in the image")
    return encoding


@router.post(
    "/enroll-image", status_code=status.HTTP_201_CREATED, dependencies=[ANY_ROLE, Depends(rate_limit("enroll_face"))]
)
async def enroll_facial_image(
    req: EnrollFacialImageRequest,
    request: Request,
    repository: BiometricRepositoryPort = Depends(get_facial_repository),
    match_logs: MatchLogRepositoryPort = Depends(get_match_log_repository),
    threshold: float = Depends(get_face_match_threshold),
    secret: str = Depends(get_liveness_secret),
    settings: Settings = Depends(get_settings),
):
    # Before consuming the challenge, so a refused caller does not burn it.
    active = await repository.find_active(req.person_id)
    await ensure_can_enroll(request, req.person_id, getattr(active, "enrolled_at", None), active is not None)
    await ensure_biometric_consent(req.person_id, bearer_or_none(request))
    encoding = _encoding_after_liveness(secret, req.challenge_token, req.image_base64, settings)
    try:
        template = await _templates(repository, match_logs).enroll(
            req.person_id,
            encoding,
            req.model_version,
            _context(request, with_actor=True),
            threshold=threshold,
            reject_duplicates_within=1.0 - threshold,
        )
    except FaceAlreadyEnrolled as exc:
        # No distance in the answer: it would tell the caller how close the other face is.
        raise HTTPException(status_code=409, detail=FACE_ALREADY_ENROLLED) from exc
    return template_response(template)


@router.post("/identify-image", dependencies=[STAFF, Depends(rate_limit("identify_face"))])
async def identify_facial_image(
    req: IdentifyFacialImageRequest,
    request: Request,
    repository: BiometricRepositoryPort = Depends(get_facial_repository),
    match_logs: MatchLogRepositoryPort = Depends(get_match_log_repository),
    threshold: float = Depends(get_face_match_threshold),
    secret: str = Depends(get_liveness_secret),
    settings: Settings = Depends(get_settings),
    match_scope: MatchScope = Depends(get_match_scope),
):
    encoding = _encoding_after_liveness(secret, req.challenge_token, req.image_base64, settings)
    return await _identify(encoding, request, repository, match_logs, threshold, match_scope)
