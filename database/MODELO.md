# Guía del Modelo de Datos — FaceAttend-Edu

## 1. Visión general

FaceAttend-Edu es una plataforma de **gestión de asistencia mediante reconocimiento biométrico** para instituciones educativas. El modelo de datos soporta:

- Gestión de personas, usuarios y credenciales
- Estructura académica (sedes, programas, cohortes, cursos)
- Horarios y sesiones de clase
- Registro de asistencia con múltiples fuentes (facial, manual, IoT, import)
- Justificaciones con soporte documental
- Actualización de plantillas biométricas con flujo de aprobación (biometric_update_case unifica FACIAL/FINGERPRINT)
- Alertas y notificaciones
- Configuración académica y de seguridad

---

## 2. Bounded Contexts (Contextos delimitados)

El modelo se divide en **8 contextos**, cada uno responsable de un área de negocio:

```
┌─────────────────────────────────────────────────────────────┐
│                      FACEATTEND-EDU (v7 - DBML)             │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│  IDENTITY   │ AUTHORIZATION│  ACADEMIC   │   SCHEDULING     │
│  (4 tablas) │ (4 tablas)  │ (8 tablas)  │  (3 tablas)      │
│ person      │ role        │ school      │ environment      │
│ app_user*   │ permission  │ program     │ schedule_block   │
│ user_session│ role_perm.  │ acad_period │ class_session    │
│ pass_policy │ user_role   │ cohort      │                  │
│ (+city DDL  │             │ course      │                  │
│  deprecated)│             │ actor_type  │                  │
│             │             │ actor       │                  │
│             │             │ enrollment  │                  │
├─────────────┼─────────────┼─────────────┼──────────────────┤
│ ATTENDANCE  │  BIOMETRIC  │ CONFIGURATION│ NOTIFICATION    │
│ (5 tablas)  │ (1 tabla + │ (2 tablas)  │  (2 tablas)      │
│ att_record  │  NoSQL)     │ acad_config │ alert_type       │
│ justif_type │ biometr_case│ sec_config  │ alert            │
│ justification│ facial_emb │             │                  │
│ sup_document│ finger_emb  │             │                  │
│ att_report† │ (MongoDB)   │             │                  │
└─────────────┴─────────────┴─────────────┴──────────────────┘
* app_user.person_id UNIQUE (1:1 con person)
† att_report = proyección derivada (filtros + resultado JSONB, sin FKs):
  se conserva en el modelo completo pero fuera del núcleo 3FN de 4 servicios.
```

---

## 3. Contexto: Identity

**Responsabilidad:** Identidad de personas, credenciales de acceso, sesiones y políticas de contraseña.

| Tabla | Descripción | PK |
|---|---|---|
| `person` | Identidad base: documento, nombre, contacto. Unicidad real `(document_type, document_number)` — CC y TI pueden compartir numeración | `person_id` (UUID) |
| `app_user` | Credenciales de acceso; 1:1 con `person` (`person_id` UNIQUE) | `user_id` (UUID) |
| `user_session` | Sesiones activas/cerradas | `session_id` (UUID) |
| `password_policy` | Reglas de complejidad de contraseña | `policy_id` (INT) |

> `city` (catálogo geográfico) está **deprecated**: DBML v6 la eliminó — las ciudades vienen de la API externa `countriesnow.space`. El DDL Liquibase `001-create-city-table.yaml` se conserva de forma transitoria pendiente de remoción.

**Reglas de integridad (v7):**
- `person.document_type` y `person.blood_type` son VARCHAR + CHECK (`chk_person_document_type`, `chk_person_blood_type`), no ENUMs nativos.

**Relaciones internas:**
- `app_user.person_id` → `person.person_id`
- `user_session.user_id` → `app_user.user_id`

**Diseño clave:** `person` **no tiene** `school_id`. La identidad es agnóstica de sede.

---

## 4. Contexto: Authorization

**Responsabilidad:** Control de acceso basado en roles (RBAC).

| Tabla | Descripción | PK |
|---|---|---|
| `role` | Catálogo de roles del sistema | `role_id` (INT) |
| `permission` | Catálogo de permisos atómicos | `permission_id` (INT) |
| `role_permission` | Asignación N:N roles ↔ permisos | `(role_id, permission_id)` |
| `user_role` | Asignación N:N usuarios ↔ roles | `(user_id, role_id)` |

**Cross-context:**
- `user_role.user_id` → `Identity.app_user.user_id` (sin FK)

**Diseño clave:** `role` **no tiene** `school_id`. Los roles son globales.

---

## 5. Contexto: Academic

**Responsabilidad:** Estructura académica: sedes, programas, periodos, cohortes, cursos, actores y matrículas.

| Tabla | Descripción | PK |
|---|---|---|
| `school` | Sede educativa | `school_id` (INT) |
| `program` | Oferta curricular de una sede | `program_id` (INT) |
| `academic_period` | Ventana temporal (trimestre/semestre) | `academic_period_id` (INT) |
| `cohort` | Grupo de estudiantes en programa + periodo | `cohort_id` (BIGINT) |
| `course` | Materia/asignatura de un programa | `course_id` (INT) |
| `academic_actor_type` | Catálogo: STUDENT / INSTRUCTOR | `actor_type_id` (SMALLINT) |
| `academic_actor` | Rol que una persona cumple en una sede | `academic_actor_id` (BIGINT) |
| `enrollment` | Matrícula de actor en una cohorte | `enrollment_id` (BIGINT) |

**Relaciones internas:**
```
school → program → course
school → program → cohort ← academic_period
academic_actor → academic_actor_type
enrollment → academic_actor
enrollment → cohort
```

**Cross-context:**
- `academic_actor.person_id` → `Identity.person.person_id` (sin FK)

**Diferencias clave:**
- **`program`**: Contenedor curricular de más alto nivel ("Tecnología en Análisis de Datos")
- **`course`**: Unidad de contenido dentro de un programa ("Bases de Datos I")
- **`cohort`**: Grupo concreto de estudiantes que avanza junto ("Ficha 2691234 — ADSI — Trimestre 1 de 2026")

---

## 6. Contexto: Scheduling

**Responsabilidad:** Traduce la estructura académica en horarios y sesiones concretas.

| Tabla | Descripción | PK |
|---|---|---|
| `environment` | Espacio físico (aula, laboratorio) | `environment_id` (INT) |
| `schedule_block` | Bloque recurrente semanal | `schedule_block_id` (BIGINT) |
| `class_session` | Materialización en una fecha concreta | `class_session_id` (BIGINT) |

**Cross-context:**
- `environment.school_id` → `Academic.school.school_id`
- `schedule_block.cohort_id` → `Academic.cohort.cohort_id`
- `schedule_block.course_id` → `Academic.course.course_id`
- `schedule_block.instructor_actor_id` → `Academic.academic_actor.academic_actor_id`

**Puente hacia Attendance:** `class_session` es la entidad que recibe registros de asistencia.

---

## 7. Contexto: Attendance

**Responsabilidad:** Registro de asistencia, justificaciones y soportes documentales.

| Tabla | Descripción | PK |
|---|---|---|
| `attendance_record` | Un registro por actor y sesión | `attendance_record_id` (BIGINT) |
| `justification_type` | Catálogo de tipos de justificación (per-school: `school_id` NULL = global). UNIQUE `(school_id, name)` + índice parcial UNIQUE `(name)` WHERE `school_id IS NULL` (en PG, NULL ≠ NULL) | `justification_type_id` (INT) |
| `justification` | Justificación de inasistencia/tardanza | `justification_id` (BIGINT) |
| `supporting_document` | Soportes documentales adjuntos | `supporting_document_id` (BIGINT) |
| `attendance_report` † | Proyección derivada de reporte (filtros + resultado JSONB, sin FKs). Fuera del núcleo 3FN de 4 servicios | `report_id` (UUID) |

**Cross-context:**
- `attendance_record.class_session_id` → `Scheduling.class_session.class_session_id`
- `attendance_record.academic_actor_id` → `Academic.academic_actor.academic_actor_id`
- `justification.reviewed_by` → `Identity.app_user.user_id`

**ENUMs:**
- `attendance_status`: Present, Absent, Late, Justified
- `capture_method`: FACIAL, MANUAL, IOT, IMPORT
- `review_status`: Pending, Approved, Rejected

---

## 8. Contexto: Biometric

**Responsabilidad:** Plantillas biométricas (facial y dactilar) + flujo de re-enrolamiento con aprobación.

**Colecciones NoSQL en MongoDB** (fuera del modelo relacional DBML):

| Colección | Campos clave |
|---|---|
| `facial_embedding` | `person_id`, `template_version`, `encoding`, `model_version`, `enrolled_at`, `is_active` |
| `fingerprint_embedding` | `person_id`, `finger_number`, `template_version`, `encoding`, `model_version`, `enrolled_at`, `is_active` |

**¿Por qué NoSQL?** Los embeddings biométricos son documentos de estructura flexible y de alto volumen de lectura/escritura por reconocimiento en tiempo real.

**Tabla SQL del contexto** (dueña lógica desde v7 — antes archivada en Configuration):

| Tabla | Descripción | PK |
|---|---|---|
| `biometric_update_case` | Solicitud de actualización biométrica (FACIAL / FINGERPRINT). `finger_number` solo para FINGERPRINT (1..10, CHECK `chk_finger_number`), nulo para FACIAL. `update_status` DEFAULT `'Pending'`. `requested_by` / `requested_at` NOT NULL | `case_id` (UUID) |

**¿Por qué es un dominio propio?** Es el único que necesita un motor distinto (documentos con vectores, no filas) y cómputo distinto (comparar vectores = CPU/GPU, no SQL).

> **Nota física transitoria:** el DDL Liquibase hospeda todavía esta tabla en el schema `configuration` (`07-ms-configuration-db`) porque los servicios 06/07 y el front-end (`endpoints.configuration.biometricCases`) dependen de esa ubicación. Mover el schema físico requiere migración con compatibilidad + cambios en back-end/front-end: deuda planificada. La referencia `current_embedding_ref` apunta al `_id` del documento en MongoDB (cross-paradigm, sin FK).

---

## 9. Contexto: Configuration

**Responsabilidad:** Parámetros configurables (pares nombre/valor).

| Tabla | Descripción | PK |
|---|---|---|
| `academic_configuration` | Parámetros por sede | `configuration_id` (INT) |
| `security_configuration` | Parámetros globales de seguridad | `configuration_id` (INT) |

> `biometric_update_case` vivía aquí hasta v6. En v7 su dueño lógico es Biometric (§8): es el flujo de re-enrolamiento, no parametrización.

---

## 10. Contexto: Notification

**Responsabilidad:** Tipos de alerta y alertas generadas sobre actores académicos.

| Tabla | Descripción | PK |
|---|---|---|
| `alert_type` | Catálogo de tipos de alerta | `alert_type_id` (SMALLINT) |
| `alert` | Alerta generada sobre un actor | `alert_id` (BIGINT) |

**Cross-context:**
- `alert.academic_actor_id` → `Academic.academic_actor.academic_actor_id`

> **Audit eliminado:** el bounded context Audit (`audit_log` / `error_log`) se removió del modelo relacional. La observabilidad (trazas, errores) la provee la plataforma, no el esquema de negocio.

---

## 11. Regla más importante: Sin FK entre contextos

> **Toda referencia entre contextos distintos se documenta como comentario, nunca como `Ref:` activa.**

Esto significa que en el código SQL/Liquibase:

```yaml
# ✅ CORRECTO - sin FK real
- column:
    name: person_id
    type: UUID
    remarks: "Cross-context reference to Identity.person (NO FK)"

# ❌ INCORRECTO - FK real entre contextos
- addForeignKeyConstraint:
    baseColumnNames: person_id
    referencedTableName: person
    referencedTableSchemaName: identity
```

**Excepción:** Las referencias **dentro** del mismo contexto SÍ usan FK reales (ej: `enrollment.cohort_id → cohort.cohort_id`, ambas en Academic).

---

## 12. Diagrama de relaciones (simplificado)

```
identity.person ─────────────────────────────────────────┐
    │ 1:1                                                 │
    ▼                                                    │
identity.app_user                              academic.academic_actor
    │                                                  │    │
    │ (cross-context)                                  │    │
    ▼                                                  │    │
authorization.user_role                        enrollment │
                                                  │    │    │
                                      academic.cohort ◄──┘    │
                                          │                   │
                                          │                   │
                              scheduling.schedule_block ──────┘
                                          │
                                          ▼
                              scheduling.class_session
                                          │
                                          ▼
                              attendance.attendance_record
                                          │
                                          ▼
                              attendance.justification
                                          │
                                          ▼
                              attendance.supporting_document
```

---

## 13. ENUMs y dominios CHECK del modelo

Los ENUMs se implementan como **tipos PostgreSQL nativos** (`02-types/` de cada dominio); el DBML los documenta como `varchar + note` porque no renderiza enums nativos. `document_type` y `blood_type` son VARCHAR + CHECK (no tipos nativos).

| Dominio | Tipo | Valores | Implementación |
|---|---|---|---|
| Identity | `user_session_status` | Active, Closed | ENUM nativo |
| Identity | `authentication_type` | Local, Windows, External | ENUM nativo |
| Identity | `document_type` | CC, TI, CE, PP | CHECK `chk_person_document_type` |
| Identity | `blood_type` | A+, A-, B+, B-, AB+, AB-, O+, O- | CHECK `chk_person_blood_type` |
| Academic | `enrollment_status` | Active, Withdrawn, Completed | ENUM nativo |
| Scheduling | `class_session_status` | Open, Closed, Cancelled | ENUM nativo |
| Scheduling | `day_of_week` | 1..7 (ISO) | CHECK `chk_block_day_of_week` |
| Attendance | `attendance_status` | Present, Absent, Late, Justified | ENUM nativo |
| Attendance | `capture_method` | FACIAL, MANUAL, IOT, IMPORT | ENUM nativo |
| Attendance | `review_status` | Pending, Approved, Rejected | ENUM nativo |
| Biometric | `biometric_type` | FACIAL, FINGERPRINT | ENUM nativo |
| Biometric | `update_status` | Pending, In_Review, Approved, Rejected | ENUM nativo |
