# Arquitectura — face-auth (Python / FastAPI)

Capas de arquitectura hexagonal:

```text
backend/
├── main.py                              # composition root: lifespan, CORS, middleware, routers
├── face_auth/
│   ├── domain/                          # puro: entidades, value_objects, policies, exceptions
│   │   ├── entities/ (User, BiometricSample)
│   │   ├── value_objects.py             # BiometricModality, TemplateStatus, MatchThreshold, AuditAction
│   │   ├── policies.py                  # face_match / fingerprint_match, calidad mínima
│   │   └── exceptions.py
│   ├── application/
│   │   ├── ports/in_/                   # contratos implementados por casos de uso
│   │   ├── ports/out/                   # UserRepository, BiometricService, AuditSink
│   │   └── use_cases/                   # registro, login, consultas y ciclo de vida
│   └── infrastructure/
│       ├── config/                       # settings y composition root de adaptadores
│       ├── biometrics/                   # adaptadores OpenCV/face_recognition
│       ├── persistence/                  # adaptadores PostgreSQL/MongoDB
│       ├── security/                     # auditoría, rate-limit y seguridad
│       ├── observability/                # middleware e instrumentación
│       └── web/                          # adaptador HTTP: routers, schemas y errores
└── tests/ (test_domain, test_use_cases, test_lifecycle_security, test_api_contract)
```

El dominio no conoce FastAPI ni motores de almacenamiento. La aplicación define los
puertos; los casos de uso dependen de ellos y la infraestructura los implementa.
`main.py` y `infrastructure/config/dependencies.py` conectan implementaciones. Los
routers son adaptadores de entrada y delegan las operaciones de consulta y escritura
a la capa de aplicación. Es una aplicación modular hexagonal, no un conjunto de
microservicios.

## Datos

- PostgreSQL = identidad (`person`, `app_user`). MongoDB = biometría
  (`face_samples`, `fingerprint_samples`, `audit_events`, `counters`).
- Separación identidad/plantilla: el encoding facial nunca va en Postgres.
- Auditoría: colección `audit_events` append-only (sin update/delete desde la app).

## Flujos

- Enrollment facial: `GET liveness-challenge` → 3× `POST liveness-step` →
  `POST /api/register/face` (challenge completo + `decode_image` + `face_encoding` +
  dedup 1:N contra `threshold` + `save`).
- Verificación 1:N: `LoginFace` recorre plantillas y elige mínima distancia ≤ umbral.
  O(N) lineal: con 100k sujetos la latencia es alta; ver Riesgos.
- Revocación: `POST /api/templates/{username}/revoke` borra encoding y deja marcador.
- Supresión: `DELETE /api/subjects/{username}` borra biométricos (Mongo) + desactiva
  identidad (soft-delete Postgres, conserva fila para FK/auditoría).
- Enrollment de huella: el SDK DigitalPersona captura en el cliente y envía la
  muestra a `POST /api/register/fingerprint-sample`; el caso de uso delega en el
  puerto `UserRepository`, implementado por `BiometricUserRepository`, que persiste
  la identidad en PostgreSQL y la muestra en MongoDB. La muestra se mantiene solo
  temporalmente en memoria del navegador durante la captura y el envío.
