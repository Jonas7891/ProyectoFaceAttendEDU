from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from domain.similarity import cosine
from infrastructure.persistence.memory_store import fingerprint_store

router = APIRouter(prefix="/api/v1/biometric/fingerprint", tags=["fingerprint"])

SIMILARITY_THRESHOLD = 0.85


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
async def enroll_fingerprint(req: EnrollFingerprintRequest):
    return fingerprint_store.enroll(req.model_dump())


@router.get("/{person_id}")
async def list_fingerprints(person_id: str):
    return {"templates": fingerprint_store.active_for(person_id)}


@router.get("/{person_id}/{finger}")
async def get_fingerprint(person_id: str, finger: int):
    active = fingerprint_store.active_for(person_id, finger)
    if not active:
        raise HTTPException(status_code=404, detail="no active fingerprint template")
    return active[0]


@router.delete("/{person_id}/{finger}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fingerprint(person_id: str, finger: int):
    if not fingerprint_store.delete_active(person_id, finger):
        raise HTTPException(status_code=404, detail="no active fingerprint template")
    return None


@router.post("/verify")
async def verify_fingerprint(req: VerifyFingerprintRequest):
    active = fingerprint_store.active_for(req.person_id, req.finger_number)
    if not active:
        raise HTTPException(status_code=404, detail="no active fingerprint template")
    score = cosine(req.encoding, active[0]["encoding"])
    return {"match": score >= SIMILARITY_THRESHOLD, "score": score}


@router.post("/identify")
async def identify_fingerprint(req: IdentifyFingerprintRequest):
    best: dict | None = None
    best_score = 0.0
    seen: dict[str, dict] = {}
    for doc in fingerprint_store._docs.values():
        if not doc["is_active"]:
            continue
        if req.finger_number is not None and doc.get("finger_number") != req.finger_number:
            continue
        key = f"{doc['person_id']}:{doc.get('finger_number')}"
        seen[key] = doc
    for doc in seen.values():
        score = cosine(req.encoding, doc["encoding"])
        if score > best_score:
            best_score = score
            best = doc
    if best is None or best_score < SIMILARITY_THRESHOLD:
        raise HTTPException(status_code=404, detail="no match found")
    return {"person_id": best["person_id"], "finger_number": best.get("finger_number"), "score": best_score}
