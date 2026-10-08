# Seguridad y privacidad — face-auth

> No es asesoría legal. Revisar con el responsable de cumplimiento (GDPR/LOPD/ley local).

## Implementado en esta iteración

- `JWT_SECRET` mínimo 32 chars (`settings.require_jwt_secret()`); aviso si falta (dev).
- CORS restringido a métodos `POST/GET/DELETE/OPTIONS` y headers mínimos.
- Headers: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`.
- `X-Request-ID` en respuestas + logs sin PII/biométricos.
- Rate limit en memoria en `/api/login/*` → `429` (con 1 réplica; con N réplicas usar Redis).
- Liveness HMAC con TTL 120s, anti-replay de un uso, poda anti-crecimiento.
- Error payloads consistentes `{detail, code}`; 401/403/404 no filtran internals.
- Docker corre como usuario no-root.
- Auditoría append-only `audit_events` (acción, sujeto, detalle ≤500 chars; jamás
  encodings/imágenes/scores).
- Revocación y supresión efectivas (ver `lifecycle_router.py`).
- Límites de payload en schemas (4MB) + límites de decode (3MB, 16MP).

## Pendiente / hardening (requiere decisión humana)

1. **Rotar `JWT_SECRET`** del `.env` local (`face-auth-jwt-2026-change-this` es débil y
   está en disco): generar `openssl rand -hex 32`, actualizar `.env` (gitignorado) y
   reiniciar. Los tokens y challenges HMAC previos se invalidan (esperado).
2. **Cifrado de plantillas en reposo**: hoy `face_samples.encoding` y
   `fingerprint_samples.data_base64` están en claro en Mongo. Cifrar con
   AES-GCM + KMS (envelope encryption) antes de persistir.
3. **AuthZ en endpoints sensibles**: `GET /api/users`, `GET /api/users/active`,
   `GET /api/users/{u}/exists` (enumeración), `GET /api/audit/events`,
   `POST revoke`, `DELETE subjects` hoy no exigen JWT/rol. Añadir Bearer + RBAC
   (operador/admin) y rate-limit más estricto.
4. **Escala del matching 1:N**: lineal O(N) en Python; con 100k enrolados el login
   degrada. Opciones: índice vectorial (pgvector/Qdrant), sharding por cohorte,
   o pasar a verificación 1:1 con `username` + umbral.
5. **Liveness básico, no anti-spoofing certificado** (ya advertido en README):
   integrar proveedor PAD para alto riesgo + HTTPS obligatorio + lockout por intentos.
6. **Retención/borrado programado**: job que purgue `audit_events` > `AUDIT_RETENTION_DAYS`
   y plantillas expiradas; backups cifrados + restore probado.
7. **Secretos**: ningún secreto en repo (`.env` gitignorado ✓); usar gestor
   (Vault/ASM/K8s secrets) en despliegue.
8. **CI**: añadir `ruff`, `mypy`, `bandit`, `pip-audit`, `pytest` y escaneo de imagen
   (`trivy`) — dependencias dev ya declaradas en `pyproject.toml`.
9. **Transaccionalidad dual-write PG+Mongo**: fallo intermedio deja identidad sin
   biometría o viceversa; añadir reconciliación/outbox si se requiere consistencia.
10. **Multi-réplica**: sesiones activas, challenges y rate-limit son en memoria por
    proceso; con `--workers > 1` o N réplicas mover a Redis con TTL.
