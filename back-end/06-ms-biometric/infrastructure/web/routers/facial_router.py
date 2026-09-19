from fastapi import APIRouter, Depends, status
router = APIRouter(prefix="/api/v1/biometric/facial", tags=["facial"])
@router.post("/enroll", status_code=status.HTTP_201_CREATED)
async def enroll_facial(): return {"status": "enrolled"}
@router.post("/verify")
async def verify_facial(): return {"match": True, "score": 0.99}
