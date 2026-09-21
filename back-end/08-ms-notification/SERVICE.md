# Notification Service â€” `08-ms-notification`

## 1. Responsabilidad

Gestionar tipos de alerta y alertas generadas automaticamente por el sistema sobre actores academicos. Servicio que consume eventos de otros servicios para disparar notificaciones.

## 2. Tablas

| Tabla | Descripcion | PK |
|-------|-------------|-----|
| `alert_type` | Catalogo de tipos de alerta | `alert_type_id` (SMALLINT) |
| `alert` | Alerta generada sobre un actor | `alert_id` (BIGINT) |

**Cross-context:**
- `alert.academic_actor_id` â†’ `Academic.academic_actor.academic_actor_id`

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

<!-- Notificaciones -->
spring-boot-starter-mail        <!-- Email -->
firebase-admin                  <!-- Push notifications (FCM) -->

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
| **Firebase Admin** | Push notifications (FCM) | Notificaciones push a moviles |
| **Spring Mail** | Envio de emails | Alertas por correo electronico |
| **Thymeleaf** | Plantillas HTML | Templates de emails |
| **Twilio SDK** | SMS | Notificaciones por SMS (alternativa) |
| **Spring Kafka** | Consumer de eventos | Recibir eventos de otros servicios |
| **Testcontainers** | Tests de integracion | PostgreSQL + Kafka en tests |
| **Resilience4j** | Circuit breaker | Proteccion contra fallos de email/push |

### 3.4 Herramientas de Desarrollo

| Herramienta | Uso |
|-------------|-----|
| **Maven** | Build tool |
| **Docker** | Containerizacion |
| **IntelliJ IDEA** | IDE |
| **DBeaver** | Cliente PostgreSQL |
| **Firebase Console** | Gestion de FCM |
| **Postman / Bruno** | Testing REST |
| **MailHog / Mailtrap** | Testing de emails en desarrollo |

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

```java
@KafkaListener(topics = {"attendance-events", "scheduling-events",
              "configuration-events", "identity-events"})
public void consumeEvent(DomainEvent event) {
    switch (event.type()) {
        case "ABSENTEEISM_DETECTED" -> createAlert(ABSENTEEISM, event);
        case "REPEATED_TARDINESS" -> createAlert(REPEATED_TARDINESS, event);
        case "JUSTIFICATION_PENDING" -> createAlert(JUSTIFICATION_PENDING, event);
        case "BIOMETRIC_UPDATE_REQUESTED" -> createAlert(BIOMETRIC_UPDATE, event);
    }
}
```

### Topicos consumidos

| Topico | Eventos â†’ Alertas |
|--------|-------------------|
| `attendance-events` | ABSENTEEISM_DETECTED, REPEATED_TARDINESS, LOW_ATTENDANCE |
| `scheduling-events` | CLASS_SESSION_CANCELLED |
| `configuration-events` | BIOMETRIC_UPDATE_REQUESTED, BIOMETRIC_UPDATE_REJECTED |
| `identity-events` | USER_AUTHENTICATION_FAILED (multiplas) |

---

## 6. Domain Events

| Evento | Trigger | Consumidores tipicos |
|--------|---------|---------------------|
| `AlertRaised` | Alerta generada | Audit (registrar), email/push service |
| `AlertResolved` | Alerta resuelta | Audit |
| `AlertTypeCreated` | Nuevo tipo de alerta | Audit |

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
       â”‚
       â–¼
Kafka Event (ABSENTEEISM_DETECTED)
       â”‚
       â–¼
Notification Service genera alert
       â”‚
       â”œâ”€â”€ Email al coordinador
       â”œâ”€â”€ Push al instructor
       â””â”€â”€ Registro en audit_log
```

---

## 8. Canales de Notificacion

| Canal | Implementacion | Uso |
|-------|---------------|-----|
| **Email** | Spring Mail + Thymeleaf | Alertas formales, reportes |
| **Push (FCM)** | Firebase Admin SDK | Notificaciones en tiempo real a movil |
| **SMS** | Twilio SDK (opcional) | Alertas criticas, sin internet |
| **In-App** | WebSocket / SSE | Notificaciones dentro de la plataforma |

---

## 9. Configuracion

### application.yml (ejemplo)

```yaml
server:
  port: 8089

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/faceattend_db
    username: postgres
    password: postgres
    hikari:
      schema: notification
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate.default_schema: notification
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
  kafka:
    bootstrap-servers: localhost:9092
    group-id: notification-service

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
| 8089 | REST API |
| 9092 | Kafka (externo) |
| 5432 | PostgreSQL (externo) |
| 587 | SMTP (externo) |
| 443 | Firebase FCM (externo) |

---

## 11. Analisis de Lenguaje

### Candidatos evaluados

| # | Lenguaje | Framework | Email Templates | Firebase SDK | Twilio SDK | Event-Driven | DX |
|---|----------|-----------|:---------------:|:------------:|:----------:|:------------:|:--:|
| 1 | **TypeScript** | NestJS/Nestia | Thymeleaf/Nunjucks | firebase-admin | twilio | RxJS | Excelente |
| 2 | Java 21 | Spring Boot | Thymeleaf | firebase-admin | twilio | Spring Kafka | Buena |
| 3 | Go 1.22 | Gin | html/template | firebase-admin | twilio | Canal propio | Moderada |

### Por que TypeScript gana

- **Templates de email**: Thymeleaf, MJML, Nunjucks â€” el ecosistema de templates HTML para email es mas rico en Node/TypeScript.
- **Firebase Admin**: SDK oficial de Google para TypeScript, bien documentado.
- **Twilio SDK**: SDK oficial de Twilio para Node.js, el mas maduro.
- **NestJS event-driven**: Modulos de event listeners nativos, integracion con Kafka via @nestjs/microservices.
- **Rapidez de desarrollo**: Los templates de email y la integracion con multiples canales se implementan mas rapido en TypeScript.
- **WebSockets/SSE**: NestJS tiene soporte nativo para notificaciones in-app via WebSockets.

### Por que no Java

- Spring Mail y Thymeleaf son excelentes pero el overhead de JVM es innecesario para un servicio de notificaciones.
- El ecosistema de templates de email es igual pero el DX de TypeScript es superior.

### Por que no Go

- Go no tiene framework de templates de email tan rico como Thymeleaf/Nunjucks.
- La integracion con Firebase y Twilio requiere mas codigo manual en Go.
- NestJS resuelve event-driven de forma mas elegante.

### Decision: TypeScript (NestJS)

Notification es un servicio **event-driven multi-canal** (email, push, SMS, in-app). TypeScript con NestJS ofrece el mejor ecosistema para templates de email, integracion con Firebase/Twilio, y manejo de eventos asincronos.

