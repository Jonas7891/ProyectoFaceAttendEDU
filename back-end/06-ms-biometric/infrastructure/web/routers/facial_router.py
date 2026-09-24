"""Facial biometric endpoints (primary adapter).

Route prefix is fixed at `/api/v1/biometric/facial` because the API gateway
(`back-end/99-api-gateway/kong/kong.yml`, route `biometric-route`) forwards
`/api/v1/biometric` to this service with `strip_path: false`, and
`front-end/Web/src/api/endpoints.ts` calls the full prefixed path.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field

from domain.entities.facial_embedding import FacialEmbedding
from domain.entities.match_log import BiometricMatchLog
from domain.ports.out.biometric_repository import BiometricRepositoryPort
from domain.ports.out.match_log_repository import MatchLogRepositoryPort
from domain.similarity import cosine
from domain.value_objects.biometric_type import BiometricType
from infrastructure.config.dependencies import (
    get_facial_repository,
    get_match_log_repository,
    get_similarity_threshold,
)
from infrastructure.web.match_audit import record_match
from infrastructure.web.schemas.responses import template_response

router = APIRouter(prefix="/api/v1/biometric/facial", tags=["facial"])

OPERATION_VERIFY = "VERIFY"
OPERATION_IDENTIFY = "IDENTIFY"
NO_ACTIVE_TEMPLATE = "no active facial template"
NO_MATCH = "no match found"


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


@router.post("/enroll", status_code=status.HTTP_201_CREATED)
async def enroll_facial(
    req: EnrollFacialRequest,
    repository: BiometricRepositoryPort = Depends(get_facial_repository),
):
    template = FacialEmbedding(
        person_id=req.person_id,
        encoding=req.encoding,
        model_version=req.model_version,
    )
    return template_response(await repository.enroll(template))


@router.get("/{person_id}")
async def get_facial(
    person_id: str,
    repository: BiometricRepositoryPort = Depends(get_facial_repository),
):
    active = await repository.find_active(person_id)
    if active is None:
        raise HTTPException(status_code=404, detail=NO_ACTIVE_TEMPLATE)
    return template_response(active)


@router.get("/{person_id}/history")
async def facial_history(
    person_id: str,
    repository: BiometricRepositoryPort = Depends(get_facial_repository),
):
    history = await repository.list_history(person_id)
    return {"history": [template_response(template) for template in history]}


@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_facial(
    person_id: str,
    repository: BiometricRepositoryPort = Depends(get_facial_repository),
):
    # Soft delete: the document stays, is_active goes false and deleted_at is set.
    if not await repository.deactivate(person_id):
        raise HTTPException(status_code=404, detail=NO_ACTIVE_TEMPLATE)
    return None


@router.post("/verify")
async def verify_facial(
    req: VerifyFacialRequest,
    request: Request,
    repository: BiometricRepositoryPort = Depends(get_facial_repository),
    match_logs: MatchLogRepositoryPort = Depends(get_match_log_repository),
    threshold: float = Depends(get_similarity_threshold),
):
    active = await repository.find_active(req.person_id)
    if active is None:
        raise HTTPException(status_code=404, detail=NO_ACTIVE_TEMPLATE)

    score = cosine(req.encoding, list(active.encoding))
    matched = score >= threshold
    await record_match(
        match_logs,
        BiometricMatchLog(
            biometric_type=BiometricType.FACIAL,
            operation=OPERATION_VERIFY,
            matched=matched,
            score=score,
            threshold=threshold,
            person_id=req.person_id,
            matched_person_id=req.person_id if matched else None,
            embedding_id=active.embedding_id,
            correlation_id=_correlation_id(request),
        ),
    )
    return {"match": matched, "score": score}


@router.post("/identify")
async def identify_facial(
    req: IdentifyFacialRequest,
    request: Request,
    repository: BiometricRepositoryPort = Depends(get_facial_repository),
    match_logs: MatchLogRepositoryPort = Depends(get_match_log_repository),
    threshold: float = Depends(get_similarity_threshold),
):
    best: FacialEmbedding | None = None
    best_score = 0.0
    # One active template per person is guaranteed by the unique partial index;
    # the guard below keeps the result deterministic if that index is missing.
    seen: set[str] = set()
    for template in await repository.list_active():
        if template.person_id in seen:
            continue
        seen.add(template.person_id)
        score = cosine(req.encoding, list(template.encoding))
        if score > best_score:
            best_score = score
            best = template

    matched = best is not None and best_score >= threshold
    await record_match(
        match_logs,
        BiometricMatchLog(
            biometric_type=BiometricType.FACIAL,
            operation=OPERATION_IDENTIFY,
            matched=matched,
            score=best_score,
            threshold=threshold,
            matched_person_id=best.person_id if matched else None,
            embedding_id=best.embedding_id if matched and best is not None else None,
            correlation_id=_correlation_id(request),
        ),
    )
    if not matched:
        raise HTTPException(status_code=404, detail=NO_MATCH)
    return {"person_id": best.person_id, "score": best_score}
