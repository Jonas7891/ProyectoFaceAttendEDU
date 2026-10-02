# Seed API test data

Seed script that creates test data across all FaceAttendEDU microservices so
web (`front-end/Web`) and mobile (`front-end/Mobile`) can test real
frontend-backend communication. Node >= 20, zero dependencies.

## Run

```bash
# from the repo root
docker compose up -d

cd tools/seed-api-test-data
cp .env.example .env   # adjust host if needed
npm run seed
```

Exit code is `0` when every request succeeds or only hits a documented known
backend bug (reported as `WARN`). Any other failure exits `1` with details.
Reruns are safe: `409 Conflict` is treated as "already exists" and chained
ids are resolved by looking up the `SEED-*` records.

## Why direct microservice URLs

The script targets microservice ports (`8081`, `8083`-`8091`) instead of the
Kong gateway (`:8080`) because most gateway routes require a JWT. Apps keep
using the gateway. Override any target in `.env` (`IDENTITY_URL`, ...).

## Pointing the apps at the backend

Web (`front-end/Web`, see `src/config/env.ts`):

```bash
EXPO_PUBLIC_API_URL=http://localhost:8080 npx expo start --web
```

Mobile (`front-end/Mobile`, see `src/config/env.js`): on a physical device
or emulator `localhost` is the phone itself, so use the PC LAN IP:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:8080 npx expo start
```

Login smoke test: `POST /api/v1/auth/login` then browse schools, sessions,
alerts and quality instruments created below.

## Seeded data

| Service | Records |
|---|---|
| identity `:8081` | 3 cities (Bogotá, Medellín, Cali), 6 persons, user `seed.admin`, `/me` check |
| authorization `:8083` | roles `Administrador`/`Instructor`/`Aprendiz`, 2 permissions |
| academic `:8084` | school `Colegio Los Andes`, program `Ingeniería de Sistemas`, period `2026-I`, cohort, 2 courses, 6 actors (`EST-2026-00x`), enrollments |
| scheduling `:8087` | 2 environments, block, session (+ open) |
| attendance `:8085` | bulk records, justification types, justification |
| biometric `:8086` | facial enroll x7 (`seed-student-01` legacy + `est-2026-00x`), verify, identify |
| configuration `:8089` | academic + security configs, biometric update case |
| notification `:8090` | alert type `ABSENTEEISM`, alerts |
| quality `:8091` | project `Evaluación institucional 2026-I`, characteristics/process/istqb instruments |

The seeded login is `SEED_USERNAME` / `SEED_PASSWORD` (defaults `seed.admin` /
`SeedAdmin123!`). `POST /api/v1/users` bcrypt-hashes the password server side, so
the plaintext is never stored or returned. Override both variables per environment
and never reuse these values outside local testing.

## ID mapping

`academic.academic_actor.person_id` is a native UUID column (cross-context
reference to `identity.person`, no FK), so the seed reuses the `personId` UUIDs
returned by `POST identity/api/v1/persons`. `biometric`/`configuration` use string
ids `est-2026-00x` (MongoDB / case file only, plus legacy `seed-student-01`); the
link between both is conventional, not a FK. Reruns are idempotent: `409` reuses
the existing record, and cities are looked up first (no unique constraint).

## Known backend bugs

None currently whitelisted in `seed.mjs` (`KNOWN_ISSUES` is empty), so any failure
fails the seed with exit code `1`.

Previously tracked here and now fixed:

1. `POST /api/v1/users` returned `400 User.passwordHash is required`. The endpoint
   now takes `{ personId, username, password }`, hashes with bcrypt cost 12 and
   returns `201`.
2. `POST` writes on scheduling/attendance hung until client timeout because their
   Kafka producer dialled `localhost:9092`. `back-end/docker-compose.yml` now sets
   `SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:29092` for `ms-scheduling` and
   `ms-attendance`, and their JDBC URLs keep `?stringtype=unspecified` so `String`
   values still coerce into native PostgreSQL enum columns.

Note: the first write that publishes to Kafka pays a one-off producer
initialisation cost, so the request timeout is 30s rather than 10s.
