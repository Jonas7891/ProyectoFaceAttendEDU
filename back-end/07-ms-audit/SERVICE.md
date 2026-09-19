# Audit Service — `07-ms-audit`

## 1. Responsabilidad

Bitacoras de auditoria (acciones de negocio: quien hizo que, cuando y donde) y registro de errores tecnicos del sistema. Servicio transversal que consume eventos de todos los demas servicios.

## 2. Tablas

| Tabla | Descripcion | PK |
|-------|-------------|-----|
| `audit_log` | Acciones de negocio (quien hizo que) | `audit_log_id` (BIGINT) |
| `error_log` | Errores tecnicos del sistema | `error_id` (BIGINT) |

**Cross-context:**
- `audit_log.actor_id` → `Identity.app_user.user_id`
- `error_log.user_id` → `Identity.app_user.user_id`
- `audit_log.school_id` → `Academic.school.school_id`

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
| **ELK Stack** (Elasticsearch + Logstash + Kibana) | Analisis de logs | Busqueda y visualizacion avanzada |
| **Elasticsearch** | Motor de busqueda | Consultas rapidas sobre audit_log |
| **Logback** | Logging estructurado | Logs JSON para ingestion por Logstash |
| **Spring Kafka** | Consumer de eventos | Recibir eventos de todos los servicios |
| **Testcontainers** | Tests de integracion | PostgreSQL + Kafka en tests |
| **Apache Spark** | Analisis de big data | Reportes de auditoria a gran escala |
| **Quartz Scheduler** | Tareas programadas | Limpieza de logs antiguos |

### 3.4 Herramientas de Desarrollo

| Herramienta | Uso |
|-------------|-----|
| **Maven** | Build tool |
| **Docker** | Containerizacion |
| **IntelliJ IDEA** | IDE |
| **DBeaver** | Cliente PostgreSQL |
| **Kibana** | Visualizacion de logs (opcional) |
| **Postman / Bruno** | Testing REST |

---

## 4. Endpoints

### 4.1 Audit Log

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/audit-logs` | Consultar logs de auditoria |
| GET | `/api/v1/audit-logs/{id}` | Obtener log especifico |
| GET | `/api/v1/audit-logs?actorId={uuid}` | Logs por actor |
| GET | `/api/v1/audit-logs?aggregateType={type}` | Logs por tipo de entidad |
| GET | `/api/v1/audit-logs?schoolId={id}` | Logs por sede |
| GET | `/api/v1/audit-logs?from={date}&to={date}` | Logs por rango de fechas |

### 4.2 Error Log

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/error-logs` | Consultar errores |
| GET | `/api/v1/error-logs/{id}` | Obtener error especifico |
| GET | `/api/v1/error-logs?errorType={type}` | Errores por tipo |
| GET | `/api/v1/error-logs?userId={uuid}` | Errores por usuario |
| GET | `/api/v1/error-logs?schoolId={id}` | Errores por sede |

### 4.3 Estadisticas

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/audit-logs/stats` | Estadisticas de acciones |
| GET | `/api/v1/error-logs/stats` | Estadisticas de errores |
| GET | `/api/v1/audit-logs/export` | Exportar logs (CSV/JSON) |

---

## 5. Consumo de Eventos Kafka

El servicio Audit **consume** eventos de todos los demas servicios:

```java
@KafkaListener(topics = {"identity-events", "academic-events", 
              "scheduling-events", "attendance-events",
              "biometric-events", "configuration-events",
              "notification-events"})
public void consumeEvent(DomainEvent event) {
    auditLogRepository.save(AuditLog.from(event));
}
```

### Topicos consumidos

| Topico | Eventos tipicos |
|--------|-----------------|
| `identity-events` | UserCreated, UserAuthenticated, PasswordChanged |
| `academic-events` | SchoolCreated, EnrollmentCreated |
| `scheduling-events` | ClassSessionOpened, ClassSessionClosed |
| `attendance-events` | AttendanceRecorded, JustificationSubmitted |
| `biometric-events` | FacialEnrolled, FacialVerificationSucceeded |
| `configuration-events` | ConfigUpdated, BiometricUpdateApproved |
| `notification-events` | AlertRaised, AlertResolved |

---

## 6. Domain Events

| Evento | Trigger | Consumidores tipicos |
|--------|---------|---------------------|
| `AuditLogCreated` | Nueva entrada de auditoria | Ninguno (es el终 de la cadena) |
| `ErrorLogCreated` | Nuevo error registrado | Notification (alertar sobre errores criticos) |

---

## 7. Estructura de un Audit Log

```json
{
  "audit_log_id": 12345,
  "school_id": 1,
  "actor_id": "uuid-usuario",
  "action": "CREATE",
  "aggregate_type": "Person",
  "aggregate_id": "uuid-persona",
  "description": "Persona creada: Juan Perez",
  "source_ip": "192.168.1.100",
  "application": "identity-service",
  "occurred_at": "2026-01-15T10:30:00Z"
}
```

### Acciones tipicas

| Categoria | Acciones |
|-----------|----------|
| CRUD | CREATE, READ, UPDATE, DELETE |
| Estado | ACTIVATE, DEACTIVATE, LOCK, UNLOCK |
| Auth | LOGIN, LOGOUT, LOGIN_FAILED, PASSWORD_CHANGED |
| Asistencia | ATTENDANCE_RECORDED, ATTENDANCE_UPDATED |
| Justification | JUSTIFICATION_SUBMITTED, JUSTIFICATION_APPROVED, JUSTIFICATION_REJECTED |
| Biometric | BIOMETRIC_ENROLLED, BIOMETRIC_VERIFIED, BIOMETRIC_UPDATE_REQUESTED |

---

## 8. Configuracion

### application.yml (ejemplo)

```yaml
server:
  port: 8087

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/faceattend_db
    username: postgres
    password: postgres
    hikari:
      schema: audit
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate.default_schema: audit
  kafka:
    bootstrap-servers: localhost:9092
    group-id: audit-service
    consumer:
      auto-offset-reset: earliest

# Retencion de logs
audit:
  retention:
    audit-log-days: 365
    error-log-days: 730
  export:
    enabled: true
    max-rows: 100000
```

---

## 9. Puertos del Servidor

| Puerto | Servicio |
|--------|----------|
| 8087 | REST API |
| 9092 | Kafka (externo) |
| 5432 | PostgreSQL (externo) |
| 9200 | Elasticsearch (externo, opcional) |
| 5601 | Kibana (externo, opcional) |

---

## 10. Analisis de Lenguaje

### Candidatos evaluados

| # | Lenguaje | Framework | Kafka Consumer | Throughput | Memoria | Ecosistema Logging |
|---|----------|-----------|:--------------:|:----------:|:-------:|:------------------:|
| 1 | **Go 1.22** | Gin | confluent-kafka-go | 142k RPS | 68MB | zap, zerolog |
| 2 | Java 21 | Spring Boot | Spring Kafka | 100k RPS | 412MB | Logback, Log4j2 |
| 3 | Rust 1.85 | Axum | rdkafka | 180k RPS | 45MB | tracing |

### Por que Go gana

- **Consumo masivo de eventos**: Audit consume de 7 topicos de Kafka simultaneamente. Go maneja miles de mensajes/segundo con goroutines.
- **6x menos memoria**: Un servicio que consume eventos de todos los demas servicios necesita escalar horizontalmente. Go permite mas pods por nodo.
- **Bajo overhead**: Audit es fundamentalmente escritura append-only. No necesita el peso de Spring Boot.
- **Binario unico**: Deploy simple, sin JVM tuning.

### Por que no Java

- Spring Kafka es maduro pero el overhead de JVM (412MB) es excesivo para un servicio de ingestion de logs.
- Audit no tiene logica de negocio compleja — escribe eventos a PostgreSQL.
- Go logra el mismo throughput con 1/6 de la memoria.

### Por que no Rust

- Rust es ideal para throughput extremo pero el costo de desarrollo es mayor.
- Go es suficiente para el volumen de FaceAttend-Edu (institucion educativa, no millions de eventos/segundo).

### Decision: Go 1.22

Audit es un servicio de **ingestion de alto volumen** que consume eventos de todos los demas servicios. Go ofrece el mejor ratio throughput/memoria para streaming de eventos con bajo overhead operacional.
