# FaceAttend-Edu — Guia General de Microservicios

## 1. Vision General

FaceAttend-Edu es una plataforma de gestion de asistencia mediante reconocimiento biometrico para instituciones educativas. La arquitectura se basa en **9 microservicios** que implementan **Domain-Driven Design (DDD)**, donde cada dominio de negocio tiene su propia base de datos logica (schema PostgreSQL) y su propio ciclo de migracion Liquibase.

```
ms/
├── 01-ms-identity/          → Identity (personas, usuarios, sesiones)
├── 02-ms-authorization/     → Authorization (RBAC: roles y permisos)
├── 03-ms-academic/          → Academic (sedes, programas, cohortes, cursos)
├── 04-ms-scheduling/        → Scheduling (horarios y sesiones de clase)
├── 05-ms-attendance/        → Attendance (asistencia, justificaciones)
├── 06-ms-biometric/         → Biometric (embeddings faciales y dactilares)
├── 07-ms-audit/             → Audit (bitacoras de auditoria y errores)
├── 08-ms-configuration/     → Configuration (parametros configurables)
├── 09-ms-notification/      → Notification (alertas y notificaciones)
└── db/                      → Migraciones Liquibase (9 schemas)
```

---

## 2. Arquitectura

### 2.1 Patron: Arquitectura Hexagonal (Puertos y Adaptadores)

Todos los servicios siguen el patron de Arquitectura Hexagonal definido en el servicio Identity:

```
com.faceattend_edu.{service}_service/
├── adapter/
│   ├── in/
│   │   └── web/
│   │       ├── controller/     ← Endpoints REST
│   │       ├── dto/            ← Request/Response DTOs
│   │       └── mapper/         ← DTO <-> Domain mappers
│   └── out/
│       └── persistence/
│           ├── entity/         ← JPA Entities
│           ├── repository/     ← Spring Data JPA repositories
│           ├── mapper/         ← Entity <-> Domain mappers
│           └── *Adapter.java   ← Port implementation
├── application/
│   ├── port/
│   │   ├── in/                 ← Use case interfaces (driving)
│   │   └── out/                ← Port interfaces (driven)
│   └── usecase/                ← Use case implementations
├── config/                     ← Spring @Configuration beans
├── domain/
│   ├── model/                  ← Domain entities (rich models)
│   ├── event/                  ← Domain events
│   ├── exception/              ← Domain exceptions
│   └── service/                ← Domain services (business logic)
└── shared/                     ← Cross-cutting concerns
```

### 2.2 Stack Tecnologico Base

FaceAttend-Edu es un sistema **polyglot**. Cada servicio usa el lenguaje y framework optimizado para su caso de uso especifico:

| Servicio | Lenguaje | Framework | Razon |
|----------|----------|-----------|-------|
| Identity | Java 21 | Spring Boot 4.1.1 | Ya implementado, ecosistema JWT/Security maduro |
| Authorization | Go 1.22 | Gin | Baja latencia para checks de permisos, 6x menos memoria |
| Academic | TypeScript | NestJS/Nestia | CRUD complejo, validacion, reportes, DX superior |
| Scheduling | Go 1.22 | Gin | Concurrencia para deteccion de conflictos de horario |
| Attendance | Go 1.22 | Gin | Alto throughput para registros IoT y facial en tiempo real |
| Biometric | Python 3.12 | FastAPI | OpenCV, dlib, TensorFlow/PyTorch nativos |
| Audit | Go 1.22 | Gin | Streaming de eventos de alto volumen, bajo overhead |
| Configuration | Go 1.22 | Gin | CRUD simple, cache, bajo consumo de recursos |
| Notification | TypeScript | NestJS/Nestia | Templates email, Firebase SDK, Twilio, event-driven |

### 2.3 Politica de Lenguajes

| Lenguaje | Servicios | Uso total | Container image |
|----------|-----------|-----------|-----------------|
| **Go 1.22** | Authorization, Scheduling, Attendance, Audit, Configuration | 5/9 servicios | ~8MB (distroless) |
| **TypeScript** | Academic, Notification | 2/9 servicios | ~50MB (node-slim) |
| **Java 21** | Identity | 1/9 servicios | ~200MB (spring-boot) |
| **Python 3.12** | Biometric | 1/9 servicios | ~150MB (python-slim) |

**Por que polyglot?**
- Cada servicio tiene requisitos distintos (ML, CRUD complejo, baja latencia, IoT)
- Go para servicios de alta frecuencia/baja latencia (5 servicios)
- TypeScript para servicios con dominio complejo y templates (2 servicios)
- Java solo donde ya esta implementado (1 servicio)
- Python solo para ML/vision (1 servicio)

### 2.4 Comunicacion entre Servicios

| Tipo | Mecanismo | Uso |
|------|-----------|-----|
| Sincrona | REST (HTTP/HTTPS) | Consultas directas, CRUD |
| Asincrona | Apache Kafka (eventos) | Domain Events, notificaciones |
| Cross-context | Referencias UUID (sin FK) | Identidad unica entre schemas |

### 2.5 Base de Datos

- **Motor:** PostgreSQL 18 (unica instancia, schemas separados)
- **Patron:** Database-per-Bounded-Context (schema por dominio)
- **Migraciones:** Liquibase con estructura estandarizada (DDL, DML, DCL, TCL, Rollbacks)
- **NoSQL:** MongoDB para embeddings biometricos (facial_embedding, fingerprint_embedding)
- **Regla de oro:** Nunca FK reales entre contextos distintos

---

## 3. Servicios

### 3.1 Identity (`01-ms-identity`)

**Responsabilidad:** Identidad de personas, credenciales de acceso, sesiones y politicas de contrasena.

**Tablas:** `city`, `person`, `app_user`, `user_session`, `password_policy`

**Endpoints principales:**
- CRUD de personas
- CRUD de usuarios
- Autenticacion (login/logout)
- Gestion de sesiones
- Activacion/desactivacion de usuarios

**Detalle:** Ver `01-ms-identity/SERVICE.md`

---

### 3.2 Authorization (`02-ms-authorization`)

**Responsabilidad:** Control de acceso basado en roles (RBAC). Roles, permisos y asignaciones usuario-rol.

**Tablas:** `role`, `permission`, `role_permission`, `user_role`

**Endpoints principales:**
- CRUD de roles y permisos
- Asignacion de roles a usuarios
- Asignacion de permisos a roles
- Evaluacion de permisos

**Detalle:** Ver `02-ms-authorization/SERVICE.md`

---

### 3.3 Academic (`03-ms-academic`)

**Responsabilidad:** Estructura academica: sedes, programas, periodos, cohortes, cursos, actores academicos y matriculas.

**Tablas:** `school`, `program`, `academic_period`, `cohort`, `course`, `academic_actor_type`, `academic_actor`, `enrollment`

**Endpoints principales:**
- CRUD de sedes, programas, periodos, cohortes, cursos
- Registro de actores academicos (estudiantes/instructores)
- Gestion de matriculas
- Consultas de estructura academica

**Detalle:** Ver `03-ms-academic/SERVICE.md`

---

### 3.4 Scheduling (`04-ms-scheduling`)

**Responsabilidad:** Traduce la estructura academica en horarios y sesiones de clase concretas.

**Tablas:** `environment`, `schedule_block`, `class_session`

**Endpoints principales:**
- CRUD de ambientes (aulas/laboratorios)
- Gestion de bloques de horario recurrentes
- Apertura/cierre de sesiones de clase
- Consulta de disponibilidad de ambientes/instructores

**Detalle:** Ver `04-ms-scheduling/SERVICE.md`

---

### 3.5 Attendance (`05-ms-attendance`)

**Responsabilidad:** Registro de asistencia con multiples fuentes (facial, manual, IoT, import), justificaciones y soportes documentales.

**Tablas:** `attendance_record`, `justification_type`, `justification`, `supporting_document`

**Endpoints principales:**
- Registro de asistencia (FACIAL, MANUAL, IOT, IMPORT)
- CRUD de justificaciones
- Gestion de documentos de soporte
- Consultas de asistencia por sesion/estudiante

**Detalle:** Ver `05-ms-attendance/SERVICE.md`

---

### 3.6 Biometric (`06-ms-biometric`)

**Responsabilidad:** Gestion de plantillas biometricas (facial y dactilar). Servicio hibrido SQL + NoSQL.

**Tablas SQL:** `biometric_update_case` (en schema Configuration)

**Colecciones NoSQL:** `facial_embedding`, `fingerprint_embedding`

**Endpoints principales:**
- Enrollment de plantillas faciales/dactilares
- Verificacion/identificacion biometrica
- Solicitud de actualizacion de plantilla
- Flujo de aprobacion de actualizaciones

**Detalle:** Ver `06-ms-biometric/SERVICE.md`

---

### 3.7 Audit (`07-ms-audit`)

**Responsabilidad:** Bitacoras de auditoria (acciones de negocio) y errores tecnicos del sistema.

**Tablas:** `audit_log`, `error_log`

**Endpoints principales:**
- Registro automatico de acciones de negocio
- Registro de errores tecnicos
- Consultas de auditoria (quien, que, cuando, donde)
- Consultas de errores por tipo/fecha/usuario

**Detalle:** Ver `07-ms-audit/SERVICE.md`

---

### 3.8 Configuration (`08-ms-configuration`)

**Responsabilidad:** Parametros configurables del sistema (academicos y de seguridad) y casos de actualizacion biometrica.

**Tablas:** `academic_configuration`, `security_configuration`, `biometric_update_case`

**Endpoints principales:**
- CRUD de configuracion academica por sede
- CRUD de configuracion de seguridad global
- Gestion de casos de actualizacion biometrica
- Flujo de aprobacion (Pending -> In_Review -> Approved/Rejected)

**Detalle:** Ver `08-ms-configuration/SERVICE.md`

---

### 3.9 Notification (`09-ms-notification`)

**Responsabilidad:** Tipos de alerta y alertas generadas automaticamente sobre actores academicos.

**Tablas:** `alert_type`, `alert`

**Endpoints principales:**
- CRUD de tipos de alerta
- Generacion automatica de alertas
- Consulta de alertas por actor/tipo/estado
- Resolucion de alertas

**Detalle:** Ver `09-ms-notification/SERVICE.md`

---

## 4. Diagrama de Dependencias

```
                    ┌─────────────┐
                    │  IDENTITY   │
                    │  (person,   │
                    │   user)     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌─────────────┐ ┌───────────┐ ┌──────────────┐
     │AUTHORIZATION│ │ ACADEMIC  │ │ BIOMETRIC    │
     │ (RBAC)      │ │ (school,  │ │ (embeddings) │
     │             │ │  program) │ │              │
     └─────────────┘ └─────┬─────┘ └──────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌─────────────┐ ┌───────────┐ ┌──────────────┐
     │ SCHEDULING  │ │CONFIGURAT.│ │NOTIFICATION  │
     │ (horarios)  │ │ (params)  │ │ (alertas)    │
     └──────┬──────┘ └───────────┘ └──────────────┘
            │
            ▼
     ┌─────────────┐
     │ ATTENDANCE  │
     │ (asistencia)│
     └──────┬──────┘
            │
            ▼
     ┌─────────────┐
     │   AUDIT     │
     │ (bitacora)  │
     └─────────────┘
```

---

## 5. Convenciones Comunes

### 5.1 Auditoria

Todas las tablas incluyen:
- `created_at`, `updated_at`, `deleted_at` (timestamps)
- `created_by`, `updated_by`, `deleted_by` (UUID de usuario)
- `row_version` (bloqueo optimista)
- Soft delete via `deleted_at` (nunca borrado fisico)

### 5.2 Identificadores

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| UUID | Entidades referenciadas entre contextos | `person_id`, `user_id` |
| INT autoincrement | Catalogos locales | `city_id`, `role_id` |
| BIGINT autoincrement | Alto volumen | `cohort_id`, `audit_log_id` |
| SMALLINT autoincrement | Catalogos pequenos | `actor_type_id`, `alert_type_id` |

### 5.3 ENUMs de PostgreSQL

Los enums se definen como `CREATE TYPE ... AS ENUM`, no como VARCHAR con validacion textual.

### 5.4 Cross-Context References

Nunca se crean FK reales entre contextos distintos. Las referencias se documentan como comentarios en Liquibase y se validan a nivel de aplicacion.

---

## 6. Ejecucion

### Arranque completo (desarrollo)

```bash
cd ms/db
docker compose up -d
```

### Servicio individual

```bash
cd ms/01-ms-identity
./mvnw spring-boot:run
```

### Verificar estado

```bash
# PostgreSQL
docker exec -it faceattend-postgres-18 psql -U postgres -d faceattend_db

# Ver esquemas
\dn

# Ver tablas de un esquema
\dt academic.*
```

---

## 7. Documentacion por Servicio

| Servicio | Documento | Estado |
|----------|-----------|--------|
| Identity | `01-ms-identity/SERVICE.md` | Implementado |
| Authorization | `02-ms-authorization/SERVICE.md` | Pendiente |
| Academic | `03-ms-academic/SERVICE.md` | Pendiente |
| Scheduling | `04-ms-scheduling/SERVICE.md` | Pendiente |
| Attendance | `05-ms-attendance/SERVICE.md` | Pendiente |
| Biometric | `06-ms-biometric/SERVICE.md` | Pendiente |
| Audit | `07-ms-audit/SERVICE.md` | Pendiente |
| Configuration | `08-ms-configuration/SERVICE.md` | Pendiente |
| Notification | `09-ms-notification/SERVICE.md` | Pendiente |
