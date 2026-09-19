"""Update-request endpoints (canonical store lives in configuration-service).

Kept here per SERVICE.md section 4.4 so gateway clients can use the
biometric base path; for the approval workflow use configuration-service.
"""
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, status
from pydantic import BaseModel, Field

from infrastructure.persistence.memory_store import update_requests

router = APIRouter(prefix="/api/v1/biometric", tags=["update-requests"])


class UpdateRequestIn(BaseModel):
    person_id: str = Field(min_length=1)
    biometric_type: str = Field(pattern="^(FACIAL|FINGERPRINT)$")
    reason: str = Field(min_length=1)


@router.post("/update-request", status_code=status.HTTP_201_CREATED)
async def create_update_request(req: UpdateRequestIn):
    record = {
        "request_id": str(uuid4()),
        "status": "Pending",
        "requested_at": datetime.now(timezone.utc).isoformat(),
        **req.model_dump(),
    }
    update_requests[record["request_id"]] = record
    return record


@router.get("/update-requests/{person_id}")
async def list_update_requests(person_id: str):
    return {"requests": [r for r in update_requests.values() if r["person_id"] == person_id]}
