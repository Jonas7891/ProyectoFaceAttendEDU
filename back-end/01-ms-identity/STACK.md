# STACK — 01-ms-identity

> **Stack ADR-005:** `Java 21 + Spring Boot 4.1.2` · **Guía:** `../../fae-docs/_stacks/java-spring.md`
> **Arquitectura:** `../../fae-docs/05-architecture/hexagonal-architecture.md` · **ADR:** `../../fae-docs/05-architecture/decisions/records/ADR-005-technology-stack.md`
> **Database:** `../database/01-ms-identity-db` (schema `identity`) · **Puerto:** `8081` · **Dominio:** `06-data/domains/01-identity.md`

## Decisión (ADR-005 §1)

**Best option: Java 21 + Spring Boot 4.1.2 (19/25)** — auth merged (JWT issuance, refresh, Redis session) handled by Spring Security out-of-the-box.

| # | Option | Perf | Eco | Learn | Lib | Ops | Total | Notes |
|---|--------|:----:|:---:|:-----:|:---:|:---:|-------|-------|
| **1** | **Java + Spring Boot** | 4 | 5 | 2 | 5 | 3 | **19** | Hibernate/JPA best ORM. Spring Security JWT/Redis. JVM overhead justified for auth. |
| 2 | TS + Fastify | 4 | 4 | 5 | 4 | 5 | 22 | Fast but needs ioredis+jose custom middleware vs Spring Security. |
| 3 | TS + NestJS | 3 | 5 | 4 | 5 | 4 | 21 | DI overhead for CRUD+auth unnecessary. |
| 4 | Python + FastAPI | 3 | 4 | 4 | 4 | 4 | 19 | Pydantic good, different runtime. |
| 5 | Go + Gin | 5 | 3 | 2 | 3 | 4 | 17 | Fastest, overkill for CRUD+auth. |

**Rationale ADR:** Spring Security `@EnableWebSecurity`, `JwtEncoder`, `RedisOperationsSessionRepository` cover auth-merge without assembling libs. Consistency with 02,04,05 reduces cognitive load. Scoring 22 for TS is raw speed, but decision weights auth completeness.

## Estructura hexagonal (java-spring.md)

```
src/main/java/com/faceattend_edu/identity_service/
├── domain/               # POJO, no Spring: model, event, exception, service
├── application/
│   ├── port/in/          # interfaces de casos de uso
│   ├── port/out/         # repositorios, EventPublisherPort, clientes externos
│   └── usecase/          # implementaciones (@Transactional)
├── adapter/
│   ├── in/web/           # controllers, dto, security (AuthTokenFilter)
│   └── out/              # persistence, messaging (DomainEventPublisher), security, storage, provisioning
└── config/
```

Regla: `domain` no importa `org.springframework.*`. Ver `SERVICE.md:148` para layout completo.

Los casos de uso publican eventos por `EventPublisherPort`: `publishAfterCommit` para cambios y
restablecimientos de contraseña y políticas (no se publica un evento cuya transacción se revirtió) y
`publish` inmediato para `UserLocked`, porque el bloqueo vive fuera de la BD. No es un outbox: si el
proceso cae entre el commit y el envío, el evento se pierde (ADR-004, AT-006).

Las reglas de capas se verifican en `LayerDependencyRulesTest`. Los nombres de rol vienen de
`Roles` (`back-end/shared/auth-java`).

## Dependencias (pom.xml:32)

Spring Boot 4.1.2 parent, `spring-boot-starter-webmvc`, `data-jpa`, `security`, `validation`, `actuator`, `kafka`, `liquibase`, `postgresql` runtime, `lombok`, `springdoc-openapi`, test starters.

## Ejecución

```bash
cd ../database && docker compose up -d          # Postgres 17 + Liquibase
./mvnw spring-boot:run                          # port 8081
curl http://localhost:8081/swagger-ui.html
```
Ver `SERVICE.md:188` para `application.yml` (schema `identity`).
