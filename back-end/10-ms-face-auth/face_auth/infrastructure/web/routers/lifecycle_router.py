"""Endpoints de ciclo de vida y auditoría (privacidad por diseño).

- POST /api/templates/{username}/revoke -> invalida plantilla facial
- DELETE /api/subjects/{username} -> supresión efectiva identidad + biométricos
- GET /api/audit/events -> últimos eventos append-only (operador)
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from ....application.ports.in_.lifecycle_use_cases import DeleteBiometricDataUseCase, RevokeBiometricTemplateUseCase
from ....application.use_cases.lifecycle import DeleteBiometricData, RevokeBiometricTemplate
from ....domain.exceptions import BiometricNotFoundError
from ...config.dependencies import get_audit_sink, get_delete_data, get_revoke_template

router = APIRouter(tags=["lifecycle"])


@router.post("/api/templates/{username}/revoke")
def revoke_template(username: str, use_case: RevokeBiometricTemplateUseCase = Depends(get_revoke_template)) -> dict:
    try:
        name = use_case.execute(username)
    except BiometricNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"ok": True, "username": name, "status": "revoked"}


@router.delete("/api/subjects/{username}")
def delete_subject(username: str, use_case: DeleteBiometricDataUseCase = Depends(get_delete_data)) -> dict:
    try:
        name = use_case.execute(username)
    except BiometricNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"ok": True, "username": name, "status": "deleted"}


@router.get("/api/audit/events")
def list_audit_events(limit: int = Query(default=100, ge=1, le=500), audit=Depends(get_audit_sink)) -> list[dict]:
    return audit.list_events(limit=limit)
