# STACK — 06-ms-biometric

> **Stack ADR-005:** `Python 3.12 + FastAPI` · **Guía:** `../../fae-docs/_stacks/python-fastapi.md`
> **Arquitectura:** `../../fae-docs/05-architecture/hexagonal-architecture.md` · **ADR:** `../../fae-docs/05-architecture/decisions/records/ADR-005-technology-stack.md`
> **Database:** `../database/06-ms-biometric-db` (schema `biometric (vacío) + MongoDB`) · **Puerto:** `8086`

## Decisión (ADR-005)

Fuente: `../../fae-docs/05-architecture/decisions/records/ADR-005-technology-stack.md` — polyglot modular monolith. Este servicio usa **`Python 3.12 + FastAPI`**.

Ver en el ADR la tabla de scoring (Performance/Ecosystem/Learning curve/Library fit/Ops) y el rationale por workload.

## Estructura hexagonal por stack

Ver guía completa en `../../fae-docs/_stacks/python-fastapi.md` y patrón en `../../fae-docs/05-architecture/hexagonal-architecture.md`.

- **Java Spring Boot** → `_stacks/java-spring.md`: `src/main/java/.../domain` (POJO sin Spring), `application/usecase`, `infrastructure/web,persistence,messaging`, `config`. Regla: `domain` no importa `org.springframework.*`.
- **TypeScript Fastify** → `_stacks/node-typescript.md`: `src/domain` (entities/VO/events/ports), `application/use-cases`, `infrastructure/http,persistence,messaging`, `main.ts`. Regla: `infrastructure → application → domain`.
- **Python FastAPI** → `_stacks/python-fastapi.md`: `domain/entities,value_objects,events,ports`, `application/use_cases`, `infrastructure/web, persistence, messaging`, `main.py` + `alembic/`. Regla: `domain` solo stdlib.
- **Go Gin** → `_stacks/go.md`: `internal/domain`, `internal/application/usecase`, `internal/infrastructure/http,postgres,kafka`, `cmd/server/main.go`, `migrations/`. Regla: `internal/domain` no importa `internal/infrastructure`.

Este servicio sigue esa estructura. Ver `SERVICE.md` § Estructura del Proyecto para el layout concreto.

## Dependencias por capa

Ver `../../fae-docs/_stacks/python-fastapi.md` § Main dependencies y `SERVICE.md` § Stack Tecnológico para el `pom.xml`/`package.json`/`pyproject.toml`/`go.mod` concreto.

## Ejecución

- **DB:** `cd ../database/06-ms-biometric-db && docker compose up` o `cd ../database && docker compose up -d`
- **Servicio:** ver `../../fae-docs/_stacks/python-fastapi.md` § Tools and minimum versions + `SERVICE.md` § Configuración (puerto `8086`)
