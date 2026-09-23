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

| Service | Records (`SEED-*` unless noted) |
|---|---|
| identity `:8081` | city, person `seed.student@example.com`, `/me` check |
| authorization `:8083` | roles `SEED_ADMIN`/`SEED_TEACHER`, 2 permissions |
| academic `:8084` | school, program, period, cohort, course, actor, enrollment |
| scheduling `:8087` | environment, block, session (+ open) |
| attendance `:8085` | bulk records, justification types, justification |
| biometric `:8086` | facial enroll, verify, identify for `seed-student-01` |
| configuration `:8089` | academic + security configs, biometric update case |
| notification `:8090` | alert type `SEED_ABSENCE`, alert |
| quality `:8091` | project, characteristics/process/istqb instruments |

In-memory services (academic, biometric, configuration, quality) lose data on
container restart; Postgres/Mongo-backed ones persist it.

## Known backend bugs (not fixed here, one task per branch)

1. `POST /api/v1/users` returns `400 User.passwordHash is required`, but
   `UserDto` exposes no password field and `UserWebMapper.toDomain` never sets
   it, so no client can create a user.
   Fix in: `back-end/01-ms-identity/.../web/dto/UserDto.java`,
   `.../web/mapper/UserWebMapper.java`.
2. `POST` writes on scheduling/attendance hang until client timeout: their
   Kafka producer dials `localhost:9092`, unreachable inside Docker.
   Fix in: `back-end/docker-compose.yml`, add
   `SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:29092` to `ms-scheduling` and
   `ms-attendance` (identity/authorization already set it).
