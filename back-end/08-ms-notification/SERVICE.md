# Notification Service — `08-ms-notification`

## 1. Responsabilidad

Gestionar tipos de alerta y alertas generadas automaticamente por el sistema sobre actores academicos. Servicio que consume eventos de otros servicios para disparar notificaciones.

## 2. Tablas

| Tabla | Descripcion | PK |
|-------|-------------|-----|
| `alert_type` | Catalogo de tipos de alerta | `alert_type_id` (SMALLINT) |
| `alert` | Alerta generada sobre un actor | `alert_id` (BIGINT) |

**Cross-context:**
- `alert.academic_actor_id` → `Academic.academic_actor.academic_actor_id`

## 3. Stack Tecnologico

### 3.1 Lenguaje y Framework

| Componente | Tecnologia | Justificacion |
|------------|-----------|---------------|
| Lenguaje | **Go 1.22** | Binario unico ~8MB, bajo consumo de memoria |
| Framework | **Gin** | Router de alto rendimiento, middleware nativo |
| Arquitectura | **Hexagonal** | Misma estructura que los demas servicios |

### 3.2 Dependencias Principales

```go
// go.mod
require (
    github.com/gin-gonic/gin v1.9.1            // HTTP framework
    github.com/jackc/pgx/v5 v5.5.0              // PostgreSQL driver
    github.com/golang-migrate/migrate/v4        // Migraciones
    github.com/go-playground/validator/v10      // Validacion de requests
    go.uber.org/zap v1.26.0                     // Structured logging
    go.opentelemetry.io/otel v1.24.0            // Observabilidad
)
```

### 3.3 Librerias Recomendadas Adicionales

| Libreria | Uso | Por que |
|----------|-----|---------|
| **pgx** | PostgreSQL driver | 3x mas rapido que database/sql, soporte nativo PostgreSQL |
| **zap** | Structured logging | Logs JSON de alta performance |
| **golang-migrate** | Migraciones | Versionado de DDL por schema |
| **validator/v10** | Validacion | Validacion de request bodies via tags |
| **OpenTelemetry** | Trazas y metricas | Observabilidad de requests |
| **firebase-admin-go** | Push notifications (FCM) | Notificaciones push a moviles |
| **twilio-go** | SMS | Notificaciones por SMS (alternativa) |
| **Testcontainers-go** | Tests de integracion | PostgreSQL + Kafka en tests |
| **gofakeit** | Datos de prueba | Generacion de datos para tests |

### 3.4 Herramientas de Desarrollo

| Herramienta | Uso |
|-------------|-----|
| **Go toolchain** | Build, test, vet, lint |
| **Docker** | Containerizacion |
| **VS Code + Go extension** | IDE principal |
| **DBeaver** | Cliente PostgreSQL |
| **Firebase Console** | Gestion de FCM |
| **Postman / Bruno** | Testing REST |
| **MailHog / Mailtrap** | Testing de emails en desarrollo |
| **golangci-lint** | Linting automatico |

---

## 4. Endpoints

### 4.1 Tipos de Alerta

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/alert-types` | Crear tipo de alerta |
| GET | `/api/v1/alert-types/{id}` | Obtener tipo |
| PUT | `/api/v1/alert-types/{id}` | Actualizar tipo |
| GET | `/api/v1/alert-types` | Listar tipos |

### 4.2 Alertas

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/alerts` | Crear alerta manual |
| GET | `/api/v1/alerts/{id}` | Obtener alerta |
| PATCH | `/api/v1/alerts/{id}/resolve` | Resolver alerta |
| GET | `/api/v1/alerts?actorId={id}` | Alertas de un actor |
| GET | `/api/v1/alerts?typeId={id}` | Alertas por tipo |
| GET | `/api/v1/alerts?resolved={bool}` | Filtrar por estado |

### 4.3 Preferencias de Notificacion

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/notification-preferences/{actorId}` | Preferencias del actor |
| PUT | `/api/v1/notification-preferences/{actorId}` | Actualizar preferencias |

---

## 5. Consumo de Eventos Kafka

El servicio Notification **consume** eventos de otros servicios para generar alertas:

```go
// Consumo de topicos de otros servicios
kafka.Consume(ctx, []string{
    "attendance-events", "scheduling-events",
    "configuration-events", "identity-events",
}, func(msg Event) {
    switch msg.Type {
    case "ABSENTEEISM_DETECTED":
        createAlert(ABSENTEEISM, msg)
    case "REPEATED_TARDINESS":
        createAlert(REPEATED_TARDINESS, msg)
    case "JUSTIFICATION_PENDING":
        createAlert(JUSTIFICATION_PENDING, msg)
    case "BIOMETRIC_UPDATE_REQUESTED":
        createAlert(BIOMETRIC_UPDATE, msg)
    }
})
```

### Topicos consumidos

| Topico | Eventos → Alertas |
|--------|-------------------|
| `attendance-events` | ABSENTEEISM_DETECTED, REPEATED_TARDINESS, LOW_ATTENDANCE |
| `scheduling-events` | CLASS_SESSION_CANCELLED |
| `configuration-events` | BIOMETRIC_UPDATE_REQUESTED, BIOMETRIC_UPDATE_REJECTED |
| `identity-events` | USER_AUTHENTICATION_FAILED (multiplas) |

---

## 6. Domain Events

| Evento | Trigger | Consumidores tipicos |
|--------|---------|---------------------|
| `AlertRaised` | Alerta generada | email/push service |
| `AlertResolved` | Alerta resuelta | — |
| `AlertTypeCreated` | Nuevo tipo de alerta | — |

---

## 7. Tipos de Alerta Predefinidos (Seeds)

| Codigo | Nombre | Descripcion |
|--------|--------|-------------|
| ABSENTEEISM | Ausentismo recurrente | Estudiante falta 3+ veces seguidas |
| REPEATED_TARDINESS | Tardanzas repetidas | Estudiante llega tarde 3+ veces seguidas |
| LOW_ATTENDANCE | Bajo porcentaje de asistencia | Asistencia < 75% |
| JUSTIFICATION_PENDING | Justificacion pendiente | Justificacion sin revisar por 48h+ |
| BIOMETRIC_UPDATE | Solicitud de actualizacion biom. | Nueva solicitud de actualizacion |

### Deteccion automatica

```
Attendance Service detecta patron
       │
       ▼
Kafka Event (ABSENTEEISM_DETECTED)
       │
       ▼
Notification Service genera alert
       │
       ├── Email al coordinador
       ├── Push al instructor
       └── Persistencia en alert (DB)
```

---

## 8. Canales de Notificacion

| Canal | Implementacion | Uso |
|-------|---------------|-----|
| **Email** | `net/smtp` + templates `html/template` | Alertas formales, reportes |
| **Push (FCM)** | firebase-admin-go | Notificaciones en tiempo real a movil |
| **SMS** | twilio-go (opcional) | Alertas criticas, sin internet |
| **In-App** | SSE / WebSocket | Notificaciones dentro de la plataforma |

---

## 9. Configuracion

### config.yaml (ejemplo)

```yaml
server:
  port: 8088

database:
  host: localhost
  port: 5432
  name: faceattend_db
  user: postgres
  password: postgres
  schema: notification

kafka:
  brokers: localhost:9092
  group-id: notification-service

# Email
mail:
  host: smtp.gmail.com
  port: 587
  username: ${MAIL_USERNAME}
  password: ${MAIL_PASSWORD}

# Firebase
firebase:
  config-path: ${FIREBASE_CONFIG_PATH:firebase-config.json}

# Canales de notificacion
notification:
  channels:
    email:
      enabled: true
    push:
      enabled: true
    sms:
      enabled: false
```

---

## 10. Puertos del Servidor

| Puerto | Servicio |
|--------|----------|
| 8088 | REST API |
| 9092 | Kafka (externo) |
| 5432 | PostgreSQL (externo) |
| 587 | SMTP (externo) |
| 443 | Firebase FCM (externo) |

---

## 11. Stack Actual

Notification esta implementado en **Go 1.22 + Gin** con arquitectura hexagonal.

### Justificacion

- **Binario unico ~8MB y bajo consumo de memoria**: ideal para un servicio ligero de 2 tablas (`alert_type`, `alert`) con alta frecuencia de escritura por eventos.
- **Gin**: Router de alto rendimiento con middleware nativo para validacion de requests.
- **pgx**: Driver PostgreSQL rapido para persistir alertas.
- **Canal propio de templates**: `html/template` (estandar de Go) para emails, `firebase-admin-go` para push y `twilio-go` para SMS.
- **Kafka + zap**: Consumo eficiente de eventos de otros servicios con logs JSON estructurados.

