from fastapi import FastAPI
from infrastructure.web.routers.facial_router import router as facial_router
from infrastructure.web.routers.fingerprint_router import router as fingerprint_router
from infrastructure.web.routers.update_router import router as update_router

app = FastAPI(title="Biometric Service", version="0.1.0")
app.include_router(facial_router)
app.include_router(fingerprint_router)
app.include_router(update_router)

@app.get("/health")
async def health(): return {"status": "ok", "service": "biometric-service"}

@app.get("/api/v1/health")
async def api_health(): return {"status": "ok", "service": "biometric-service"}

# Run: uvicorn main:app --reload --port 8086
