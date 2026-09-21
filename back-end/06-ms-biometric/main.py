import time
import uuid
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from infrastructure.web.routers.facial_router import router as facial_router
from infrastructure.web.routers.fingerprint_router import router as fingerprint_router
from infrastructure.web.routers.update_router import router as update_router

STARTED_AT = time.time()

app = FastAPI(title="Biometric Service", version="0.1.0")


@app.middleware("http")
async def iso25010_middleware(request: Request, call_next):
    # Seguridad/Mantenibilidad: correlación + medición de desempeño.
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    response.headers["x-request-id"] = request_id
    response.headers["x-process-time-ms"] = str(elapsed_ms)
    response.headers["x-content-type-options"] = "nosniff"
    return response


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    # Fiabilidad/Compatibilidad: envolvente uniforme sin fuga de stack.
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "NotFound" if exc.status_code == 404 else "BadRequest" if exc.status_code < 500 else "InternalError",
            "message": str(exc.detail),
            "path": str(request.url.path),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": "BadRequest",
            "message": "Invalid biometric payload",
            "details": exc.errors(),
            "path": str(request.url.path),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalError",
            "message": "Unexpected internal error",
            "path": str(request.url.path),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


def _health(service: str):
    return {
        "status": "ok",
        "service": service,
        "version": app.version,
        "uptimeSeconds": int(time.time() - STARTED_AT),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


app.include_router(facial_router)
app.include_router(fingerprint_router)
app.include_router(update_router)

@app.get("/health")
async def health(): return _health("biometric-service")

@app.get("/api/v1/health")
async def api_health(): return _health("biometric-service")

# Run: uvicorn main:app --reload --port 8086
