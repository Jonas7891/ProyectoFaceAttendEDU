# 10-ms-face-auth

Servicio de biometría web de FaceAttend EDU, integrado desde
[face-auth](https://github.com/Jonas7891/face-auth). FastAPI + OpenCV/dlib; un
solo contenedor atiende las tres capacidades que consume la pantalla
**Biometría** del frontend:

| Capacidad | Endpoints (tras Kong: prefijo `/face-auth`) |
|---|---|
| Registro de rostro (3 gestos de prueba de vida) | `GET /api/face/liveness-challenge`, `POST /api/face/liveness-step`, `POST /api/register/face` |
| Reconocimiento facial (2 gestos) | `GET /api/face/liveness-challenge?actions=2`, `POST /api/face/liveness-step`, `POST /api/login/face` |
| Registro / reconocimiento de huella (DigitalPersona 4500) | `POST /api/register/fingerprint-sample`, `POST /api/login/fingerprint-sample` |
| Directorio y ciclo de vida | `GET /api/users`, `GET /api/users/active`, `GET /api/users/{u}/exists`, `POST /api/templates/{u}/revoke`, `DELETE /api/subjects/{u}`, `GET /api/audit/events` |
| Salud | `GET /api/health`, `GET /api/ready` |

## Datos

- **PostgreSQL** (`face-auth-postgres`, base `face_auth`): `person` + `app_user`
  propios del servicio. Es una base **aparte** de `faceattend_db`: no forma parte
  del modelo relacional de los 8 schemas ni crea FKs hacia él.
- **MongoDB** (contenedor `mongodb` compartido, base `faceattend_face_auth`):
  `face_samples`, `fingerprint_samples`, `counters`, auditoría.

## Cambios respecto al repo original

- `TRUST_PROXY_HEADERS=1`: el rate limit usa la IP real que Kong añade a
  `X-Forwarded-For` (sin esto todos los clientes compartirían el cupo de la IP del gateway).
- Se retiró el frontend Vite/React: la UI vive ahora en `front-end/Web`
  (pantalla `Biometría`) con el sistema de diseño de FaceAttend EDU.

## Acceso

El puerto 8000 del contenedor **no** se expone a la red: el navegador entra por
Kong (`/face-auth/*`), que exige una sesión FaceAttend válida. Para depurar hay
un puerto de loopback (`FACE_AUTH_PORT`, 8091 por defecto).

Tests: `pip install -r requirements.txt pytest httpx && python -m pytest -q`.
Documentación original del servicio: [`docs/`](docs/).
