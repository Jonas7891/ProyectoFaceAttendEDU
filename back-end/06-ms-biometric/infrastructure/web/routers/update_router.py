"""Update-request endpoints (canonical store lives in configuration-service).

Kept here per SERVICE.md §4.4 so gateway clients can use the biometric base
path; for the approval workflow use configuration-service.

Persisted in the MongoDB `biometric_update_cases` collection and **soft deleted
only**: `DELETE` flags the document (`is_active=false`, `deleted_at` set) and
never removes it, so the review trail survives.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from domain.entities.update_case import BiometricUpdateCase
from domain.ports.out.update_case_repository import UpdateCaseRepositoryPort
from domain.value_objects.biometric_type import BiometricType
from domain.value_objects.update_case_status import UpdateCaseStatus
from infrastructure.config.dependencies import get_update_case_repository
from infrastructure.web.schemas.responses import update_case_response

router = APIRouter(prefix="/api/v1/biometric", tags=["update-requests"])

NOT_FOUND = "update request not found"


class UpdateRequestIn(BaseModel):
    person_id: str = Field(min_length=1)
    biometric_type: str = Field(pattern="^(FACIAL|FINGERPRINT)$")
    reason: str = Field(min_length=1)


class ReviewUpdateRequestIn(BaseModel):
    status: str = Field(pattern="^(Approved|Rejected|In_Review)$")


@router.post("/update-request", status_code=status.HTTP_201_CREATED)
async def create_update_request(
    req: UpdateRequestIn,
    repository: UpdateCaseRepositoryPort = Depends(get_update_case_repository),
):
    case = BiometricUpdateCase(
        person_id=req.person_id,
        biometric_type=BiometricType(req.biometric_type),
        reason=req.reason,
        status=UpdateCaseStatus.PENDING,
    )
    return update_case_response(await repository.create(case))


@router.get("/update-requests/{person_id}")
async def list_update_requests(
    person_id: str,
    repository: UpdateCaseRepositoryPort = Depends(get_update_case_repository),
):
    cases = await repository.list_for_person(person_id)
    return {"requests": [update_case_response(case) for case in cases]}


@router.patch("/update-request/{request_id}/review", status_code=status.HTTP_200_OK)
async def review_update_request(
    request_id: str,
    req: ReviewUpdateRequestIn,
    repository: UpdateCaseRepositoryPort = Depends(get_update_case_repository),
):
    reviewed = await repository.review(request_id, UpdateCaseStatus(req.status))
    if reviewed is None:
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    return update_case_response(reviewed)


@router.delete("/update-request/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_update_request(
    request_id: str,
    repository: UpdateCaseRepositoryPort = Depends(get_update_case_repository),
):
    if not await repository.deactivate(request_id):
        raise HTTPException(status_code=404, detail=NOT_FOUND)
    return None
