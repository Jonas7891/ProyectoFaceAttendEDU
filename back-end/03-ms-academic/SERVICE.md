# Academic Service — `03-ms-academic`

## 1. Responsabilidad

Gestionar la estructura academica completa: sedes educativas, programas curriculares, periodos academicos, cohortes, cursos, actores academicos (estudiantes/instructores) y matriculas.

## 2. Tablas

| Tabla | Descripcion | PK |
|-------|-------------|-----|
| `school` | Sede educativa | `school_id` (INT) |
| `program` | Oferta curricular de una sede | `program_id` (INT) |
| `academic_period` | Ventana temporal (trimestre/semestre) | `academic_period_id` (INT) |
| `cohort` | Grupo de estudiantes en programa + periodo | `cohort_id` (BIGINT) |
| `course` | Materia/asignatura de un programa | `course_id` (INT) |
| `academic_actor_type` | Catalogo: STUDENT / INSTRUCTOR | `actor_type_id` (SMALLINT) |
| `academic_actor` | Rol que una persona cumple en una sede | `academic_actor_id` (BIGINT) |
| `enrollment` | Matricula de actor en una cohorte | `enrollment_id` (BIGINT) |

**Cross-context:** `academic_actor.person_id` referencia a `Identity.person.person_id` (sin FK real)

## 3. Stack Tecnologico

### 3.1 Lenguaje y Framework

| Componente | Tecnologia | Justificacion |
|------------|-----------|---------------|
| Lenguaje | **Java 21** | Consistencia con el proyecto |
| Framework | **Spring Boot 4.1.1** | Ecosistema unificado |
| Arquitectura | **Hexagonal** | Misma estructura que Identity |

### 3.2 Dependencias Principales

```xml
<!-- Core -->
spring-boot-starter-webmvc
spring-boot-starter-data-jpa
spring-boot-starter-security
spring-boot-starter-validation
spring-boot-starter-actuator
spring-boot-starter-kafka
spring-boot-starter-liquibase

<!-- Persistencia -->
postgresql

<!-- API Documentation -->
springdoc-openapi-starter-webmvc-ui

<!-- Utilidades -->
lombok
mapstruct
mapstruct-processor
```

### 3.3 Librerias Recomendadas Adicionales

| Libreria | Uso | Por que |
|----------|-----|---------|
| **MapStruct** | Mapeo DTO <-> Entity | Type-safe, compile-time |
| **Lombok** | Boilerplate reduction | Reduce codigo repetitivo |
| **Testcontainers** | Tests de integracion | PostgreSQL real |
| **Spring Cache** | Cache de consultas academicas | Caffeine para catalogos |
| **Caffeine** | Cache local | Catalogos que cambian poco (school, program) |
| ** Apache POI** | Exportacion Excel/CSV | Reportes de matriculas y cohortes |
| **Thymeleaf** | Generacion de reportes HTML | Certificados, constancias |

### 3.4 Herramientas de Desarrollo

| Herramienta | Uso |
|-------------|-----|
| **Maven** | Build tool |
| **Docker** | Containerizacion |
| **IntelliJ IDEA** | IDE |
| **DBeaver** | Cliente PostgreSQL |
| **Postman / Bruno** | Testing REST |

---

## 4. Endpoints

### 4.1 Sedes (School)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/schools` | Crear sede |
| GET | `/api/v1/schools/{id}` | Obtener sede |
| PUT | `/api/v1/schools/{id}` | Actualizar sede |
| PATCH | `/api/v1/schools/{id}/status` | Activar/desactivar |
| GET | `/api/v1/schools` | Listar sedes |

### 4.2 Programas

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/schools/{schoolId}/programs` | Crear programa en sede |
| GET | `/api/v1/programs/{id}` | Obtener programa |
| PUT | `/api/v1/programs/{id}` | Actualizar programa |
| GET | `/api/v1/schools/{schoolId}/programs` | Programas de una sede |

### 4.3 Periodos Academicos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/schools/{schoolId}/periods` | Crear periodo |
| GET | `/api/v1/periods/{id}` | Obtener periodo |
| PUT | `/api/v1/periods/{id}` | Actualizar periodo |
| GET | `/api/v1/schools/{schoolId}/periods` | Periodos de una sede |

### 4.4 Cohortes

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/cohorts` | Crear cohorte |
| GET | `/api/v1/cohorts/{id}` | Obtener cohorte |
| PUT | `/api/v1/cohorts/{id}` | Actualizar cohorte |
| GET | `/api/v1/programs/{programId}/cohorts` | Cohortes de un programa |

### 4.5 Cursos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/programs/{programId}/courses` | Crear curso en programa |
| GET | `/api/v1/courses/{id}` | Obtener curso |
| PUT | `/api/v1/courses/{id}` | Actualizar curso |
| GET | `/api/v1/programs/{programId}/courses` | Cursos de un programa |

### 4.6 Actores Academicos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/academic-actors` | Registrar actor (estudiante/instructor) |
| GET | `/api/v1/academic-actors/{id}` | Obtener actor |
| GET | `/api/v1/schools/{schoolId}/actors` | Actores de una sede |
| PATCH | `/api/v1/academic-actors/{id}/status` | Activar/desactivar |

### 4.7 Matriculas

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/enrollments` | Crear matricula |
| GET | `/api/v1/enrollments/{id}` | Obtener matricula |
| PATCH | `/api/v1/enrollments/{id}/status` | Cambiar estado (Active/Withdrawn/Completed) |
| GET | `/api/v1/cohorts/{cohortId}/enrollments` | Matriculas de una cohorte |
| GET | `/api/v1/academic-actors/{actorId}/enrollments` | Matriculas de un actor |

---

## 5. Domain Events

| Evento | Trigger | Consumidores tipicos |
|--------|---------|---------------------|
| `SchoolCreated` | Nueva sede | Audit |
| `SchoolActivated` | Sede activada | Audit |
| `SchoolDeactivated` | Sede desactivada | Audit, Notification |
| `EnrollmentCreated` | Nueva matricula | Audit, Notification |
| `EnrollmentStatusChanged` | Estado de matricula cambia | Audit, Notification |
| `CohortCreated` | Nueva cohorte | Audit, Scheduling |

---

## 6. Relaciones del Modelo

```
school ──> program ──> course
  │            │
  │            └──> cohort <── academic_period
  │                      │
  │                      └──> enrollment ──> academic_actor
  │
  └──> academic_actor ──> academic_actor_type
```

### Diferencias clave

- **program**: Contenedor curricular de mas alto nivel ("Tecnologia en Analisis de Datos")
- **course**: Unidad de contenido dentro de un programa ("Bases de Datos I")
- **cohort**: Grupo concreto de estudiantes que avanza junto ("Ficha 2691234 -- Trimestre 1 de 2026")
- **academic_actor**: Una misma persona puede ser instructor en una sede y estudiante en otra

---

## 7. Configuracion

### application.yml (ejemplo)

```yaml
server:
  port: 8083

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/faceattend_db
    username: postgres
    password: postgres
    hikari:
      schema: academic
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate.default_schema: academic
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=500,expireAfterWrite=30m
  kafka:
    bootstrap-servers: localhost:9092
    group-id: academic-service
```

---

## 8. Puertos del Servidor

| Puerto | Servicio |
|--------|----------|
| 8083 | REST API |
| 9092 | Kafka (externo) |
| 5432 | PostgreSQL (externo) |

---

## 9. Analisis de Lenguaje

### Candidatos evaluados

| # | Lenguaje | Framework | ORM | Validacion | Reportes | DX |
|---|----------|-----------|:---:|:----------:|:--------:|:--:|
| 1 | **TypeScript** | NestJS/Nestia | Prisma/Drizzle | class-validator, Zod | Excelente (xlsx, pdfmake) | Excelente |
| 2 | Java 21 | Spring Boot | JPA/Hibernate | Jakarta Validation | Apache POI | Buena |
| 3 | Go 1.22 | Gin | sqlc/Ent | Manual | reportlab-go | Moderada |

### Por que TypeScript gana

- **Validacion declarativa**: class-validator + DTOs de NestJS validan complejos academicos (cohortes, matriculas, periodos) con decoradores concisos.
- **Prisma/Drizzle ORM**: Type-safe queries con auto-completado en compile-time. Migrationes declarativas.
- **Reportes**: pdfmake, exceljs, puppeteer — ecosistema de generacion de documentos mas rico que Go.
- **DX superior**: Auto-completado, refactorizaciones seguras, hot-reload en desarrollo.
- **Endpoints tipados**: Nestia genera tipos TypeScript directamente desde los controllers, compartibles con el frontend.

### Por que no Java

- CRUD complejo con 8 tablas y multiples relaciones. NestJS es mas conciso para estos patrones.
- Apache POI es pesado para reportes simples. exceljs/pdfmake son mas ligeros.
- Sin ventaja de rendimiento significativa para un servicio CRUD.

### Por que no Go

- Go no tiene ORM maduro comparable a Prisma. sqlc requiere escribir SQL manualmente.
- La validacion de complejos academicos (cohorte = programa + periodo + sede) es verbosa sin framework de validacion declarativo.
- Los reportes (certificados, constancias) son mas faciles con el ecosistema Node/TypeScript.

### Decision: TypeScript (NestJS)

Academic es un servicio de **CRDD pesado** (Create-Read-Delete-Dominio) con reglas de negocio complejas. NestJS ofrece la mejor combinacion de validacion declarativa, ORM type-safe, y generacion de reportes.
