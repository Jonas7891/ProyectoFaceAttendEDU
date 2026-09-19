from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from domain.similarity import cosine
from infrastructure.persistence.memory_store import facial_store

router = APIRouter(prefix="/api/v1/biometric/facial", tags=["facial"])

SIMILARITY_THRESHOLD = 0.85


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
async def enroll_facial(req: EnrollFacialRequest):
    return facial_store.enroll(req.model_dump())


@router.get("/{person_id}")
async def get_facial(person_id: str):
    active = facial_store.active_for(person_id)
    if not active:
        raise HTTPException(status_code=404, detail="no active facial template")
    return active[0]


@router.get("/{person_id}/history")
async def facial_history(person_id: str):
    return {"history": facial_store.history_for(person_id)}


@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_facial(person_id: str):
    if not facial_store.delete_active(person_id):
        raise HTTPException(status_code=404, detail="no active facial template")
    return None


@router.post("/verify")
async def verify_facial(req: VerifyFacialRequest):
    active = facial_store.active_for(req.person_id)
    if not active:
        raise HTTPException(status_code=404, detail="no active facial template")
    score = cosine(req.encoding, active[0]["encoding"])
    return {"match": score >= SIMILARITY_THRESHOLD, "score": score}


@router.post("/identify")
async def identify_facial(req: IdentifyFacialRequest):
    best: dict | None = None
    best_score = 0.0
    seen: dict[str, dict] = {}
    for doc in facial_store._docs.values():
        if not doc["is_active"]:
            continue
        seen[doc["person_id"]] = doc
    for doc in seen.values():
        score = cosine(req.encoding, doc["encoding"])
        if score > best_score:
            best_score = score
            best = doc
    if best is None or best_score < SIMILARITY_THRESHOLD:
        raise HTTPException(status_code=404, detail="no match found")
    return {"person_id": best["person_id"], "score": best_score}
