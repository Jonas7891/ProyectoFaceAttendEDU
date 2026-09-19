# Configuration Service â€” `07-ms-configuration`

## 1. Responsabilidad

Gestionar parametros configurables del sistema (academicos por sede y de seguridad globales) y el flujo de aprobacion de actualizaciones biometricas.

## 2. Tablas

| Tabla | Descripcion | PK |
|-------|-------------|-----|
| `academic_configuration` | Parametros por sede (tardy_tolerance, etc.) | `configuration_id` (INT) |
| `security_configuration` | Parametros globales de seguridad | `configuration_id` (INT) |
| `biometric_update_case` | Solicitud de actualizacion biometrica | `case_id` (UUID) |

**Cross-context:**
- `academic_configuration.school_id` â†’ `Academic.school.school_id`
- `biometric_update_case.person_id` â†’ `Identity.person.person_id`
- `biometric_update_case.requested_by` â†’ `Identity.app_user.user_id`
- `biometric_update_case.reviewed_by` â†’ `Identity.app_user.user_id`

## 3. Stack Tecnologico

### 3.1 Lenguaje y Framework

| Componente | Tecnologia | Justificacion |
|------------|-----------|---------------|
| Lenguaje | **Java 21** | Consistencia con el proyecto |
| Framework | **Spring Boot 4.1.1** | Ecosistema unificado |
| Arquitectura | **Hexagonal** | Misma estructura |

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
| **MapStruct** | Mapeo DTO <-> Entity | Type-safe |
| **Lombok** | Boilerplate reduction | Reduce codigo |
| **Spring Cache** | Cache de configuraciones | Redis/Caffeine para lectura frecuente |
| **Caffeine** | Cache local | Configuraciones no cambian seguido |
| **Spring Cloud Config** | Config centralizada | Alternativa si se necesita config externa |
| **Testcontainers** | Tests de integracion | PostgreSQL real |

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

### 4.1 Configuracion Academica

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/configurations/academic` | Crear configuracion academica |
| GET | `/api/v1/configurations/academic/{id}` | Obtener configuracion |
| PUT | `/api/v1/configurations/academic/{id}` | Actualizar configuracion |
| GET | `/api/v1/schools/{schoolId}/configurations` | Configuraciones de una sede |
| GET | `/api/v1/configurations/academic?name={name}` | Buscar por nombre |

### 4.2 Configuracion de Seguridad

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/configurations/security` | Crear configuracion de seguridad |
| GET | `/api/v1/configurations/security/{id}` | Obtener configuracion |
| PUT | `/api/v1/configurations/security/{id}` | Actualizar configuracion |
| GET | `/api/v1/configurations/security` | Listar todas |
| GET | `/api/v1/configurations/security?name={name}` | Buscar por nombre |

### 4.3 Casos de Actualizacion Biometrica

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/biometric-update-cases` | Crear solicitud |
| GET | `/api/v1/biometric-update-cases/{id}` | Obtener solicitud |
| PATCH | `/api/v1/biometric-update-cases/{id}/review` | Revisar solicitud |
| GET | `/api/v1/biometric-update-cases?status={status}` | Filtrar por estado |
| GET | `/api/v1/persons/{personId}/biometric-cases` | Casos de una persona |

---

## 5. Domain Events

| Evento | Trigger | Consumidores tipicos |
|--------|---------|---------------------|
| `AcademicConfigurationUpdated` | Config academica modificada | Audit, Scheduling |
| `SecurityConfigurationUpdated` | Config seguridad modificada | Audit, Identity |
| `BiometricUpdateRequested` | Solicitud de actualizacion biom. | Biometric, Notification |
| `BiometricUpdateApproved` | Solicitud aprobada | Biometric (aplicar cambio) |
| `BiometricUpdateRejected` | Solicitud rechazada | Notification (informar) |

---

## 6. Flujo de Actualizacion Biometrica

```
academic_actor/person solicita actualizacion
       â”‚
       â–¼
biometric_update_case (Pending)
       â”‚
       â”‚ reviewer revisa
       â–¼
biometric_update_case (In_Review)
       â”‚
       â”œâ”€â”€ APPROVED â”€â”€> Biometric aplica nuevo embedding
       â”‚                  â”‚
       â”‚                  â–¼
       â”‚              facial/fingerprint_embedding (nueva version)
       â”‚
       â””â”€â”€ REJECTED â”€â”€> Notification informa al solicitante
```

### Estados de actualizacion

| Estado | Descripcion |
|--------|-------------|
| Pending | Solicitud creada, esperando revision |
| In_Review | Un revisor esta evaluando la solicitud |
| Approved | Solicitud aprobada, Biometric debe aplicar |
| Rejected | Solicitud rechazada con notas |

### Campos de `biometric_update_case`

| Campo | Descripcion |
|-------|-------------|
| `biometric_type` | FACIAL / FINGERPRINT |
| `finger_number` | 1..10 solo si FINGERPRINT, nulo si FACIAL |
| `current_embedding_ref` | Referencia logica al documento activo en MongoDB |
| `reason` | Motivo de la actualizacion |
| `requested_by` | Quien solicito |
| `reviewed_by` | Quien reviso |
| `resolution_notes` | Notas de la decision |

---

## 7. Configuracion

### application.yml (ejemplo)

```yaml
server:
  port: 8088

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/faceattend_db
    username: postgres
    password: postgres
    hikari:
      schema: configuration
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate.default_schema: configuration
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=200,expireAfterWrite=60m
  kafka:
    bootstrap-servers: localhost:9092
    group-id: configuration-service
```

---

## 8. Puertos del Servidor

| Puerto | Servicio |
|--------|----------|
| 8088 | REST API |
| 9092 | Kafka (externo) |
| 5432 | PostgreSQL (externo) |

---

## 9. Analisis de Lenguaje

### Candidatos evaluados

| # | Lenguaje | Framework | Cache | Throughput | Memoria | Complejidad |
|---|----------|-----------|:-----:|:----------:|:-------:|:-----------:|
| 1 | **Go 1.22** | Gin | ristretto/bigcache | 142k RPS | 68MB | Baja |
| 2 | Java 21 | Spring Boot | Caffeine | 100k RPS | 412MB | Moderada |
| 3 | TypeScript | NestJS | cache-manager | 54k RPS | 120MB | Baja |

### Por que Go gana

- **CRUD simple**: Configuration es esencialmente lectura/escritura de parametros. Go lo resuelve de forma minima.
- **Cache de alta velocidad**: ristretto/bigcache son caches Go que operan a nanosegundos.
- **Bajo consumo**: 68MB vs 412MB para un servicio que casi no tiene logica de negocio.
- **Consistencia con otros servicios Go**: Authorization, Scheduling, Attendance, Audit ya son Go.

### Por que no Java

- Spring Boot es overkill para un servicio de configuracion CRUD.
- Caffeine es excelente pero el overhead de JVM no se justifica aqui.

### Por que no TypeScript

- TypeScript funciona pero Go tiene mejor rendimiento para el mismo esfuerzo de desarrollo.

### Decision: Go 1.22

Configuration es el servicio **mas simple** del sistema. Go resuelve CRUD + cache con el minimo overhead posible, manteniendo consistencia con la mayoria de servicios del sistema.

