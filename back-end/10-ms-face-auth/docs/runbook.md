# Runbook — operación local

## Requisitos

- Docker + Compose. Python solo para tests rápidos (unitarios no requieren DB).

## Arranque

```powershell
Copy-Item .env.example .env   # y cambia JWT_SECRET por uno de 32+ chars
docker compose up -d --build
curl http://localhost:8000/api/health
curl http://localhost:8000/api/ready
```

## Tests (sin DB)

```powershell
Push-Location backend
C:\Users\jonat\OneDrive\Documentos\Codificacion\face-auth\.venv\Scripts\python.exe -m pytest -q tests
Pop-Location
```

21 tests: dominio, casos de uso, ciclo de vida/privacidad, contrato de rutas.

## Verificación con DB (Docker)

```powershell
docker compose exec backend python scripts/seed_users.py --count 1000 --prefix qa
docker compose exec backend python scripts/purge_legacy_mongo_users.py
```

## Endpoints nuevos

```powershell
curl -X POST http://localhost:8000/api/templates/alice/revoke
curl -X DELETE http://localhost:8000/api/subjects/alice
curl "http://localhost:8000/api/audit/events?limit=20"
```

## Calidad (cuando haya tooling instalado)

```powershell
ruff check backend
mypy backend
bandit -r backend/face_auth
pip-audit
```

## Incidentes

- `503 /api/ready`: revisar `docker compose logs postgres mongo backend`.
- `401 Rostro no reconocido`: comprobar umbral `MATCH_THRESHOLD`, calidad de captura,
  y `audit_events` (`verify_failure`).
- `429`: rate-limit por IP; esperar ventana (`RATE_LIMIT_WINDOW_SECONDS`) o ajustar.
- Rotación de `JWT_SECRET`: invalida JWTs y challenges en curso; coordinar ventana.
