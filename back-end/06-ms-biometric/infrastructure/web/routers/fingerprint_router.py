"""Fingerprint biometric endpoints (primary adapter).

Route prefix is fixed at `/api/v1/biometric/fingerprint` — see the note in
`facial_router.py` about the Kong route and the front-end client.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field

from domain.entities.fingerprint_embedding import FingerprintEmbedding
from domain.entities.match_log import BiometricMatchLog
from domain.ports.out.biometric_repository import BiometricRepositoryPort
from domain.ports.out.match_log_repository import MatchLogRepositoryPort
from domain.similarity import cosine
from domain.value_objects.biometric_type import BiometricType
from infrastructure.config.dependencies import (
    get_fingerprint_repository,
    get_match_log_repository,
    get_similarity_threshold,
)
from infrastructure.web.match_audit import record_match
from infrastructure.web.schemas.responses import template_response

router = APIRouter(prefix="/api/v1/biometric/fingerprint", tags=["fingerprint"])

OPERATION_VERIFY = "VERIFY"
OPERATION_IDENTIFY = "IDENTIFY"
NO_ACTIVE_TEMPLATE = "no active fingerprint template"
NO_MATCH = "no match found"


def _correlation_id(request: Request) -> str | None:
    return getattr(request.state, "correlation_id", None)


class EnrollFingerprintRequest(BaseModel):
    person_id: str = Field(min_length=1)
    finger_number: int = Field(ge=1, le=10)
    encoding: list[float] = Field(min_length=1)
    model_version: str = "fingerprint-v1"


class VerifyFingerprintRequest(BaseModel):
    person_id: str = Field(min_length=1)
    finger_number: int = Field(ge=1, le=10)
    encoding: list[float] = Field(min_length=1)


class IdentifyFingerprintRequest(BaseModel):
    encoding: list[float] = Field(min_length=1)
    finger_number: int | None = Field(default=None, ge=1, le=10)


@router.post("/enroll", status_code=status.HTTP_201_CREATED)
async def enroll_fingerprint(
    req: EnrollFingerprintRequest,
    repository: BiometricRepositoryPort = Depends(get_fingerprint_repository),
):
    template = FingerprintEmbedding(
        person_id=req.person_id,
        finger_number=req.finger_number,
        encoding=req.encoding,
        model_version=req.model_version,
    )
    return template_response(await repository.enroll(template))


@router.get("/{person_id}")
async def list_fingerprints(
    person_id: str,
    repository: BiometricRepositoryPort = Depends(get_fingerprint_repository),
):
    templates = await repository.list_active(person_id)
    return {"templates": [template_response(template) for template in templates]}


@router.get("/{person_id}/{finger}")
async def get_fingerprint(
    person_id: str,
    finger: int,
    repository: BiometricRepositoryPort = Depends(get_fingerprint_repository),
):
    active = await repository.find_active(person_id, finger)
    if active is None:
        raise HTTPException(status_code=404, detail=NO_ACTIVE_TEMPLATE)
    return template_response(active)


@router.delete("/{person_id}/{finger}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fingerprint(
    person_id: str,
    finger: int,
    repository: BiometricRepositoryPort = Depends(get_fingerprint_repository),
):
    # Soft delete: the document stays, is_active goes false and deleted_at is set.
    if not await repository.deactivate(person_id, finger):
        raise HTTPException(status_code=404, detail=NO_ACTIVE_TEMPLATE)
    return None


@router.post("/verify")
async def verify_fingerprint(
    req: VerifyFingerprintRequest,
    request: Request,
    repository: BiometricRepositoryPort = Depends(get_fingerprint_repository),
    match_logs: MatchLogRepositoryPort = Depends(get_match_log_repository),
    threshold: float = Depends(get_similarity_threshold),
):
    active = await repository.find_active(req.person_id, req.finger_number)
    if active is None:
        raise HTTPException(status_code=404, detail=NO_ACTIVE_TEMPLATE)

    score = cosine(req.encoding, list(active.encoding))
    matched = score >= threshold
    await record_match(
        match_logs,
        BiometricMatchLog(
            biometric_type=BiometricType.FINGERPRINT,
            operation=OPERATION_VERIFY,
            matched=matched,
            score=score,
            threshold=threshold,
            person_id=req.person_id,
            matched_person_id=req.person_id if matched else None,
            finger_number=req.finger_number,
            embedding_id=active.embedding_id,
            correlation_id=_correlation_id(request),
        ),
    )
    return {"match": matched, "score": score}


@router.post("/identify")
async def identify_fingerprint(
    req: IdentifyFingerprintRequest,
    request: Request,
    repository: BiometricRepositoryPort = Depends(get_fingerprint_repository),
    match_logs: MatchLogRepositoryPort = Depends(get_match_log_repository),
    threshold: float = Depends(get_similarity_threshold),
):
    best: FingerprintEmbedding | None = None
    best_score = 0.0
    # One active template per (person, finger) is guaranteed by the unique
    # partial index; the guard keeps the result deterministic if it is missing.
    seen: set[tuple[str, int]] = set()
    for template in await repository.list_active(finger_number=req.finger_number):
        key = (template.person_id, template.finger_number)
        if key in seen:
            continue
        seen.add(key)
        score = cosine(req.encoding, list(template.encoding))
        if score > best_score:
            best_score = score
            best = template

    matched = best is not None and best_score >= threshold
    await record_match(
        match_logs,
        BiometricMatchLog(
            biometric_type=BiometricType.FINGERPRINT,
            operation=OPERATION_IDENTIFY,
            matched=matched,
            score=best_score,
            threshold=threshold,
            matched_person_id=best.person_id if matched else None,
            finger_number=req.finger_number,
            embedding_id=best.embedding_id if matched and best is not None else None,
            correlation_id=_correlation_id(request),
        ),
    )
    if not matched:
        raise HTTPException(status_code=404, detail=NO_MATCH)
    return {
        "person_id": best.person_id,
        "finger_number": best.finger_number,
        "score": best_score,
    }
