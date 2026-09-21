# STACK — 08-ms-notification

> **Stack ADR-005:** `Go 1.22 + Gin` · **Guía:** `../../fae-docs/_stacks/go.md`
> **Arquitectura:** `../../fae-docs/05-architecture/hexagonal-architecture.md` · **ADR:** `../../fae-docs/05-architecture/decisions/records/ADR-005-technology-stack.md`
> **Database:** `../database/08-ms-notification-db` (schema `notification`) · **Puerto:** `8090` · **Dominio:** `06-data/domains/07-notification.md`

## Decisión (ADR-005 §7)

**Best option: Go 1.22 + Gin (17/25)** — lightweight 2 tables, tiny binary.

| # | Option | Perf | Eco | Learn | Lib | Ops | Total | Notes |
|---|--------|:----:|:---:|:-----:|:---:|:---:|-------|-------|
| **1** | **Go + Gin** | 5 | 3 | 2 | 3 | 4 | **17** | 5-10 MB binary, ideal low-complexity. |
| 2 | TS + Fastify | 4 | 4 | 5 | 4 | 5 | 22 | 20 min coding, fastest to implement. |
| 3 | TS + NestJS | 3 | 5 | 4 | 5 | 4 | 21 | Overkill 2 tables. |
| 4 | Python + FastAPI | 3 | 4 | 4 | 4 | 4 | 19 | Different runtime trivial. |
| 5 | Java + Spring Boot | 4 | 5 | 2 | 5 | 3 | 19 | 2 tables don't need Spring. |

**Rationale:** Smallest footprint, simplicity for alert lifecycle raised→resolved, low-risk Go learning (5-10 MB).

## Estructura hexagonal (go.md)

```
internal/
├── domain/ entity.go, event.go, port/in.go+out.go
├── application/usecase/ create_alert.go
└── infrastructure/
    ├── http/handler/ alert_handler.go + dto
    ├── postgres/ alert_repository.go
    └── config/wire.go
cmd/server/main.go
migrations/
```

## Dependencias (go.mod)

Gin 1.9, validator 10, pgx 5, golang-migrate 4, otel, zap.

## Ejecución

```bash
go run ./cmd/server/...  # 8090
go test ./...
```
