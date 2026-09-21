# 99-api-gateway — Kong OSS

> **Puerto:** 8080 proxy / 8001 admin — Stack ADR-005/007: Kong OSS DB-less + Redis
> **Fuente:** ../../fae-docs/05-architecture/decisions/records/ADR-007-api-gateway.md + ADR-005

## Responsabilidad
Edge: routing, JWT, rate limiting, CORS, TLS. Enruta a modular monolith 8081-8090 interno, extraction-ready.

## Estructura
99-api-gateway/
  kong/kong.yml
  docker-compose.yml
  SERVICE.md / STACK.md / DATA_MODEL.md

## Run
cd 99-api-gateway; docker compose up -d; curl http://localhost:8080/api/v1/persons; curl http://localhost:8001/
