import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from face_auth.infrastructure.config.dependencies import close_dependencies, initialize_dependencies
from face_auth.infrastructure.config.settings import settings
from face_auth.infrastructure.observability.middleware import (
    RequestContextMiddleware,
    SecurityHeadersMiddleware,
)
from face_auth.infrastructure.web.error_handlers import register_error_handlers
from face_auth.infrastructure.web.routers.auth_router import router
from face_auth.infrastructure.web.routers.lifecycle_router import router as lifecycle_router

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    initialize_dependencies()
    try:
        yield
    finally:
        close_dependencies()


app = FastAPI(title="Face & Fingerprint Auth API", lifespan=lifespan)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["POST", "GET", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    allow_credentials=False,
    max_age=600,
)
register_error_handlers(app)
app.include_router(router)
app.include_router(lifecycle_router)
