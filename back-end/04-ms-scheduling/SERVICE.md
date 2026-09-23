# Scheduling Service — `04-ms-scheduling`

## 1. Responsabilidad

Traducir la estructura academica en horarios recurrentes y sesiones de clase concretas. Gestionar ambientes (aulas/laboratorios), bloques de horario y la apertura/cierre de sesiones.

## 2. Tablas

| Tabla | Descripcion | PK |
|-------|-------------|-----|
| `environment` | Espacio fisico (aula, laboratorio) | `environment_id` (INT) |
| `schedule_block` | Bloque recurrente semanal | `schedule_block_id` (BIGINT) |
| `class_session` | Materializacion en una fecha concreta | `class_session_id` (BIGINT) |

**Cross-context:**
- `environment.school_id` → `Academic.school.school_id`
- `schedule_block.cohort_id` → `Academic.cohort.cohort_id`
- `schedule_block.course_id` → `Academic.course.course_id`
- `schedule_block.instructor_actor_id` → `Academic.academic_actor.academic_actor_id`

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
| **JTime** | Manejo de horas y zonas horarias | Trabajar con `LocalTime`, `DayOfWeek` de forma segura |
| **Google Calendar API** | Sincronizacion con calendarios externos | Exportar horarios a Google Calendar |
| **iCal4j** | Generacion de archivos ICS | Exportar horarios en formato iCalendar |
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

### 4.1 Ambientes

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/schools/{schoolId}/environments` | Crear ambiente |
| GET | `/api/v1/environments/{id}` | Obtener ambiente |
| PUT | `/api/v1/environments/{id}` | Actualizar ambiente |
| PATCH | `/api/v1/environments/{id}/status` | Activar/desactivar |
| GET | `/api/v1/schools/{schoolId}/environments` | Ambientes de una sede |

### 4.2 Bloques de Horario

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/schedule-blocks` | Crear bloque de horario |
| GET | `/api/v1/schedule-blocks/{id}` | Obtener bloque |
| PUT | `/api/v1/schedule-blocks/{id}` | Actualizar bloque |
| GET | `/api/v1/cohorts/{cohortId}/blocks` | Bloques de una cohorte |
| GET | `/api/v1/environments/{envId}/blocks` | Bloques de un ambiente |
| GET | `/api/v1/academic-actors/{actorId}/blocks` | Bloques de un instructor |

### 4.3 Sesiones de Clase

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/class-sessions` | Crear sesion (materializar bloque) |
| GET | `/api/v1/class-sessions/{id}` | Obtener sesion |
| PATCH | `/api/v1/class-sessions/{id}/open` | Abrir sesion (instructor) |
| PATCH | `/api/v1/class-sessions/{id}/close` | Cerrar sesion |
| PATCH | `/api/v1/class-sessions/{id}/cancel` | Cancelar sesion |
| GET | `/api/v1/schedule-blocks/{blockId}/sessions` | Sesiones de un bloque |

---

## 5. Domain Events

| Evento | Trigger | Consumidores tipicos |
|--------|---------|---------------------|
| `ScheduleBlockCreated` | Nuevo bloque de horario | Audit |
| `ClassSessionOpened` | Sesion abierta por instructor | Attendance (habilitar registro) |
| `ClassSessionClosed` | Sesion cerrada | Attendance (calcular estadisticas), Notification |
| `ClassSessionCancelled` | Sesion cancelada | Attendance, Notification |

---

## 6. Flujo de Sesiones

```
schedule_block (definicion recurrente)
       │
       │ Cada semana genera...
       ▼
class_session (fecha concreta)
       │
       ├── OPEN ──────> Attendance puede registrar asistencia
       │
       ├── CLOSED ────> Attendance calcula estadisticas
       │
       └── CANCELLED ─> No se registra asistencia
```

### Estados de sesion

| Estado | Descripcion |
|--------|-------------|
| Open | Sesion abierta, aceptando registros de asistencia |
| Closed | Sesion cerrada, asistencia finalizada |
| Cancelled | Sesion cancelada, sin registro posible |

### Validaciones de unicidad

- `(environment_id, day_of_week, starts_at)` unico → Un ambiente no puede tener dos clases simultaneas
- `(instructor_actor_id, day_of_week, starts_at)` unico → Un instructor no puede estar en dos lugares simultaneamente

---

## 7. Configuracion

### application.yml (ejemplo)

```yaml
server:
  port: 8084

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/faceattend_db
    username: postgres
    password: postgres
    hikari:
      schema: scheduling
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate.default_schema: scheduling
  kafka:
    bootstrap-servers: localhost:9092
    group-id: scheduling-service
```

---

## 8. Puertos del Servidor

| Puerto | Servicio |
|--------|----------|
| 8084 | REST API |
| 9092 | Kafka (externo) |
| 5432 | PostgreSQL (externo) |

---

## 9. Analisis de Lenguaje

### Candidatos evaluados

| # | Lenguaje | Framework | Concurrencia | Latencia p99 | Memoria | Deployment |
|---|----------|-----------|:------------:|:------------:|:-------:|:----------:|
| 1 | **Go 1.22** | Gin | Goroutines (M:N) | 8ms | 68MB | Binario ~8MB |
| 2 | Java 21 | Spring Boot | Virtual Threads | 12ms | 412MB | JAR ~200MB |
| 3 | Rust 1.85 | Axum | Async/Await | 5ms | 45MB | Binario ~2MB |

### Por que Go gana

- **Deteccion de conflictos concurrente**: Goroutines evaluan simultaneamente si un bloque de horario choca con otros en el mismo ambiente/instructor. Miles de goroutines = miles de validaciones en paralelo.
- **Baja latencia**: p99 de 8ms vs 12ms de Java. Critico cuando un instructor intenta agendar y debe recibir respuesta rapida.
- **6x menos memoria**: 68MB vs 412MB. En un sistema con muchos horarios, la densidad de pods importa.
- **Simplicidad**: El modelo de concurrencia de Go (channels + goroutines) es mas natural para conflictos de horarios que el modelo de Java.

### Por que no Java

- Virtual Threads cierra la brecha de concurrencia, pero el overhead de Spring Boot (412MB) es excesivo para un servicio de horarios.
- La deteccion de conflictos es inherentemente concurrente — Go la resuelve de forma mas natural.

### Por que no Rust

- Rust ofrece mejor latencia (5ms p99) pero el costo de desarrollo es 3-4x mayor.
- El learning curve de Rust (8-12 semanas) no se justifica para un servicio de scheduling.
- Go es suficientemente rapido y mucho mas rapido de desarrollar.

### Decision: Go 1.22

Scheduling requiere **concurrencia real** para detectar conflictos de horarios en tiempo real. Goroutines son el modelo natural para evaluar multiples restricciones simultaneamente (ambiente, instructor, cohorte).
