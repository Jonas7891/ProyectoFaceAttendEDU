from fastapi import FastAPI
from infrastructure.web.routers.facial_router import router as facial_router

app = FastAPI(title="Biometric Service", version="0.1.0")
app.include_router(facial_router)

@app.get("/health")
async def health(): return {"status": "ok", "service": "biometric-service"}

# Run: uvicorn main:app --reload --port 8086
