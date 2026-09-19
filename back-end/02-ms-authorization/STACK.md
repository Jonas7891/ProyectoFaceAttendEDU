# STACK — 02-ms-authorization

> **Stack ADR-005:** `Java 21 + Spring Boot 3` · **Guía:** `../../fae-docs/_stacks/java-spring.md`
> **Arquitectura:** `../../fae-docs/05-architecture/hexagonal-architecture.md` · **ADR:** `../../fae-docs/05-architecture/decisions/records/ADR-005-technology-stack.md`
> **Database:** `../database/02-ms-authorization-db` (schema `authorization`) · **Puerto:** `8083`

## Decisión (ADR-005)

Fuente: `../../fae-docs/05-architecture/decisions/records/ADR-005-technology-stack.md` — polyglot modular monolith. Este servicio usa **`Java 21 + Spring Boot 3`**.

Ver en el ADR la tabla de scoring (Performance/Ecosystem/Learning curve/Library fit/Ops) y el rationale por workload.

## Estructura hexagonal por stack

Ver guía completa en `../../fae-docs/_stacks/java-spring.md` y patrón en `../../fae-docs/05-architecture/hexagonal-architecture.md`.

- **Java Spring Boot** → `_stacks/java-spring.md`: `src/main/java/.../domain` (POJO sin Spring), `application/usecase`, `infrastructure/web,persistence,messaging`, `config`. Regla: `domain` no importa `org.springframework.*`.
- **TypeScript Fastify** → `_stacks/node-typescript.md`: `src/domain` (entities/VO/events/ports), `application/use-cases`, `infrastructure/http,persistence,messaging`, `main.ts`. Regla: `infrastructure → application → domain`.
- **Python FastAPI** → `_stacks/python-fastapi.md`: `domain/entities,value_objects,events,ports`, `application/use_cases`, `infrastructure/web, persistence, messaging`, `main.py` + `alembic/`. Regla: `domain` solo stdlib.
- **Go Gin** → `_stacks/go.md`: `internal/domain`, `internal/application/usecase`, `internal/infrastructure/http,postgres,kafka`, `cmd/server/main.go`, `migrations/`. Regla: `internal/domain` no importa `internal/infrastructure`.

Este servicio sigue esa estructura. Ver `SERVICE.md` § Estructura del Proyecto para el layout concreto.

## Dependencias por capa

Ver `../../fae-docs/_stacks/java-spring.md` § Main dependencies y `SERVICE.md` § Stack Tecnológico para el `pom.xml`/`package.json`/`pyproject.toml`/`go.mod` concreto.

## Ejecución

- **DB:** `cd ../database/02-ms-authorization-db && docker compose up` o `cd ../database && docker compose up -d`
- **Servicio:** ver `../../fae-docs/_stacks/java-spring.md` § Tools and minimum versions + `SERVICE.md` § Configuración (puerto `8083`)
