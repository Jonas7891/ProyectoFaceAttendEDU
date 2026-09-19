# Identity Service — `01-ms-identity`

## 1. Responsabilidad

Gestionar la identidad de personas, credenciales de acceso, sesiones de usuario y politicas de contrasena. Es el servicio fundacional que alimenta a todos los demas.

## 2. Tablas

| Tabla | Descripcion | PK |
|-------|-------------|-----|
| `city` | Catalogo de ciudades colombianas | `city_id` (INT) |
| `person` | Identidad base: documento, nombre, contacto | `person_id` (UUID) |
| `app_user` | Credenciales de acceso; 1:1 con `person` | `user_id` (UUID) |
| `user_session` | Sesiones activas/cerradas | `session_id` (UUID) |
| `password_policy` | Reglas de complejidad de contrasena | `policy_id` (INT) |

## 3. Stack Tecnologico

### 3.1 Lenguaje y Framework

| Componente | Tecnologia | Justificacion |
|------------|-----------|---------------|
| Lenguaje | **Java 21** | LTS, records, sealed classes, pattern matching |
| Framework | **Spring Boot 4.1.1** | Madurez, ecosistema, compatibilidad con el proyecto |
| Arquitectura | **Hexagonal** | Separacion de concerns, testabilidad |

### 3.2 Dependencias Principales

```xml
<!-- Core -->
spring-boot-starter-webmvc       <!-- REST API -->
spring-boot-starter-data-jpa     <!-- Persistencia JPA -->
spring-boot-starter-security     <!-- Autenticacion/Autorizacion -->
spring-boot-starter-validation   <!-- Bean Validation -->
spring-boot-starter-actuator     <!-- Health checks, metrics -->
spring-boot-starter-kafka        <!-- Domain Events asincronos -->
spring-boot-starter-liquibase    <!-- Migraciones DB -->

<!-- Persistencia -->
postgresql                       <!-- Driver PostgreSQL -->
spring-boot-starter-data-jpa-test <!-- Testcontainers JPA -->

<!-- API Documentation -->
springdoc-openapi-starter-webmvc-ui  <!-- Swagger UI -->

<!-- Utilidades -->
lombok                           <!-- Boilerplate reduction -->
mapstruct                        <!-- Mapeo DTO <-> Domain -->
mapstruct-processor              <!-- Anotacion processor MapStruct -->
```

### 3.3 Librerias Recomendadas Adicionales

| Libreria | Uso | Por que |
|----------|-----|---------|
| **MapStruct** | Mapeo DTO <-> Entity <-> Domain | Type-safe, genera codigo en compile-time, sin reflection |
| **Lombok** | Getters, setters, builders, records | Reduce boilerplate significativamente |
| **SpringDoc OpenAPI** | Documentacion Swagger/OpenAPI 3.1 | Genera documentacion automatica del API |
| **Testcontainers** | Tests de integracion con PostgreSQL real | Tests confiables contra BD real en Docker |
| **WireMock** | Mock de servicios externos en tests | Simula respuestas de otros microservicios |
| **Awaitility** | Tests asincronos | Verifica resultados de operaciones asincronas (Kafka) |
| **ArchUnit** | Tests de arquitectura | Valida reglas hexagonales (dependencias de paquetes) |
| **Resilience4j** | Circuit breaker, retry | Proteccion contra fallos de servicios dependientes |
| **Micrometer** | Metrics | Integracion con Prometheus/Grafana |
| **Spring Boot Actuator** | Health, info, metrics | Observabilidad del servicio |

### 3.4 Herramientas de Desarrollo

| Herramienta | Uso |
|-------------|-----|
| **Maven** | Build tool y gestion de dependencias |
| **Docker** | Containerizacion y desarrollo local |
| **Docker Compose** | Orquestacion de servicios (PostgreSQL, Kafka) |
| **IntelliJ IDEA** | IDE principal para desarrollo Java |
| **Postman / Bruno** | Testing de endpoints REST |
| **DBeaver** | Cliente grafico para PostgreSQL |
| **Liquibase** | Gestion de migraciones de base de datos |

### 3.5 Testing

| Tipo | Herramienta | Uso |
|------|------------|-----|
| Unit Tests | JUnit 5 + Mockito | Pruebas de dominio y use cases |
| Integration | Spring Boot Test + Testcontainers | Pruebas con BD real |
| API Tests | MockMvc / WebTestClient | Pruebas de endpoints |
| Architecture | ArchUnit | Validar reglas de paquetes |

---

## 4. Endpoints

### 4.1 Personas

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/persons` | Crear persona |
| GET | `/api/v1/persons/{id}` | Obtener persona |
| PUT | `/api/v1/persons/{id}` | Actualizar persona |
| PATCH | `/api/v1/persons/{id}/status` | Activar/desactivar |
| GET | `/api/v1/persons` | Listar personas |

### 4.2 Usuarios

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/users` | Crear usuario |
| GET | `/api/v1/users/{id}` | Obtener usuario |
| PUT | `/api/v1/users/{id}` | Actualizar usuario |
| PATCH | `/api/v1/users/{id}/status` | Activar/desactivar |
| POST | `/api/v1/users/{id}/change-password` | Cambiar contrasena |

### 4.3 Autenticacion

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Iniciar sesion |
| POST | `/api/v1/auth/logout` | Cerrar sesion |
| GET | `/api/v1/auth/me` | Usuario actual |

### 4.4 Sesiones

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/sessions` | Listar sesiones del usuario |
| DELETE | `/api/v1/sessions/{id}` | Revocar sesion |

---

## 5. Domain Events

El servicio Identity publica estos eventos via Kafka:

| Evento | Trigger | Consumidores tipicos |
|--------|---------|---------------------|
| `PersonCreated` | Nueva persona registrada | Academic, Biometric |
| `PersonActivated` | Persona activada | Todos |
| `PersonDeactivated` | Persona desactivada | Todos |
| `UserCreated` | Nuevo usuario creado | Authorization |
| `UserAuthenticated` | Login exitoso | Audit |
| `UserAuthenticationFailed` | Login fallido | Audit, Notification |
| `UserSessionStarted` | Sesion abierta | Audit |
| `UserSessionClosed` | Sesion cerrada | Audit |
| `PasswordChanged` | Contrasena cambiada | Audit |

---

## 6. Estructura del Proyecto

```
01-ms-identity/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/faceattend_edu/identity_service/
│   │   │   ├── adapter/
│   │   │   │   ├── in/web/
│   │   │   │   │   ├── controller/    ← AuthController, PersonController, etc.
│   │   │   │   │   ├── dto/           ← AuthRequest, PersonDto, UserDto
│   │   │   │   │   └── mapper/        ← WebMapper implementations
│   │   │   │   └── out/persistence/
│   │   │   │       ├── entity/        ← PersonJpaEntity, UserJpaEntity
│   │   │   │       ├── repository/    ← Spring Data JPA repos
│   │   │   │       ├── mapper/        ← PersistenceMapper implementations
│   │   │   │       └── *Adapter.java  ← Port implementations
│   │   │   ├── application/
│   │   │   │   ├── port/
│   │   │   │   │   ├── in/            ← Use case interfaces
│   │   │   │   │   └── out/           ← Port interfaces
│   │   │   │   └── usecase/           ← Use case implementations
│   │   │   ├── config/                ← Security, Kafka, beans
│   │   │   ├── domain/
│   │   │   │   ├── model/             ← Person, User, UserSession
│   │   │   │   ├── event/             ← Domain events
│   │   │   │   ├── exception/         ← Domain exceptions
│   │   │   │   └── service/           ← Domain services
│   │   │   ├── shared/                ← Cross-cutting
│   │   │   └── IdentityServiceApplication.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/changelog/          ← Liquibase (embedded)
│   └── test/
└── target/
```

---

## 7. Configuracion

### application.yml (ejemplo)

```yaml
server:
  port: 8081

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/faceattend_db
    username: postgres
    password: postgres
    hikari:
      schema: identity
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate.default_schema: identity
  kafka:
    bootstrap-servers: localhost:9092
    group-id: identity-service

springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
```

---

## 8. Puertos del Servidor

| Puerto | Servicio |
|--------|----------|
| 8081 | REST API |
| 9092 | Kafka (externo) |
| 5432 | PostgreSQL (externo) |

---

## 9. Analisis de Lenguaje

### Candidatos evaluados

| # | Lenguaje | Framework | Ecosistema JWT/Security | ORM | Rendimiento | Ecosistema |
|---|----------|-----------|:-----------------------:|:---:|:-----------:|:----------:|
| 1 | **Java 21** | Spring Boot 4.1.1 | Excelente (Spring Security) | JPA/Hibernate | Excelente | Mas grande del mundo |
| 2 | C# .NET 8 | ASP.NET Core | Excelente (Identity) | Entity Framework | Excelente | Muy grande, enterprise |
| 3 | Go 1.22 | Gin + golang-jwt | Bueno (manual) | pgx/sqlc | Excelente | Moderado, cloud-native |

### Por que Java gana

- **Spring Security**: La libreria de seguridad mas madura y completa del ecosistema JVM. JWT, sesiones, OAuth2, RBAC nativo.
- **Identity ya implementado**: 90+ archivos Java con arquitectura hexagonal completa. Reescribir en otro lenguaje no justifica el costo.
- **Ecosistema**: Spring Data JPA, Liquibase, Kafka, OpenAPI — todo integrado y probado en produccion.
- **Virtual Threads (JEP 444)**: Java 21 cierra la brecha de concurrencia con Go.

### Por que no C# .NET 8

- Mismo nivel de madurez que Java, pero sin ventaja para este caso de uso.
- Requeriria reescribir todo el proyecto existente.
- Menor ecosistema de seguridad biometrica que Java.

### Por que no Go

- Spring Security resuelve JWT, sesiones y politicas de forma integral.
- Go requiere implementar manualmente lo que Spring Security da "out of the box".
- Identity tiene dominios complejos (personas, usuarios, sesiones, escuelas) donde JPA simplifica el ORM.

### Decision: Java 21

Identity es el servicio base del sistema. Java 21 con Spring Boot ofrece el ecosistema mas completo para identidad y seguridad. El proyecto ya esta implementado y funcionando.
