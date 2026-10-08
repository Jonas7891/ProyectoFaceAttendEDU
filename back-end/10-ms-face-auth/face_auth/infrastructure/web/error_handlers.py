"""Manejadores de error consistentes: {detail, code, request_id} sin filtrar internals."""
from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from ..observability.middleware import inc


def _payload(detail: str, code: str, status: int) -> JSONResponse:
    return JSONResponse(status_code=status, content={"detail": detail, "code": code})


def _validation_response(exc: RequestValidationError) -> JSONResponse:
    errors = [
        {
            "loc": error.get("loc", ()),
            "msg": error.get("msg", "Valor inválido"),
            "type": error.get("type", "value_error"),
        }
        for error in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content={"detail": errors, "code": "validation_error"},
    )


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def _http(request: Request, exc: StarletteHTTPException) -> JSONResponse:  # noqa: ARG001
        if exc.status_code in (401, 403, 404):
            inc("biometric_unauthorized_access_total")
        return _payload(str(exc.detail), "http_error", exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def _validation(request: Request, exc: RequestValidationError) -> JSONResponse:  # noqa: ARG001
        return _validation_response(exc)

    @app.exception_handler(ValueError)
    async def _value(request: Request, exc: ValueError) -> JSONResponse:  # noqa: ARG001
        return _payload(str(exc) or "Solicitud inválida", "bad_request", 400)

    @app.exception_handler(PermissionError)
    async def _perm(request: Request, exc: PermissionError) -> JSONResponse:  # noqa: ARG001
        inc("biometric_match_failure_total")
        return _payload(str(exc) or "No autorizado", "forbidden", 401)
