# Guía del Modelo de Datos — FaceAttend-Edu

## 1. Visión general

FaceAttend-Edu es una plataforma de **gestión de asistencia mediante reconocimiento biométrico** para instituciones educativas. El modelo de datos soporta:

- Gestión de personas, usuarios y credenciales
- Estructura académica (sedes, programas, cohortes, cursos)
- Horarios y sesiones de clase
- Registro de asistencia con múltiples fuentes (facial, manual, IoT)
- Justificaciones con soporte documental
- Actualización de plantillas biométricas con flujo de aprobación
- Alertas y notificaciones
- Configuración y notificaciones

---

## 2. Bounded Contexts (Contextos delimitados)

El modelo se divide en **8 contextos**, cada uno responsable de un área de negocio:

```
┌─────────────────────────────────────────────────────────────┐
│                      FACEATTEND-EDU                         │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│  IDENTITY   │ AUTHORIZATION│  ACADEMIC   │   SCHEDULING     │
│             │             │             │                  │
│ city        │ role        │ school      │ environment      │
│ person      │ permission  │ program     │ schedule_block   │
│ app_user    │ role_perm.  │ acad_period │ class_session    │
│ user_session│ user_role   │ cohort      │                  │
│ pass_policy │             │ course      │                  │
│             │             │ actor_type  │                  │
│             │             │ actor       │                  │
│             │             │ enrollment  │                  │
├─────────────┼─────────────┼─────────────┼──────────────────┤
│ ATTENDANCE  │  BIOMETRIC  │ CONFIGURATION│  NOTIFICATION   │
│             │  (NoSQL)    │             │                  │
│ att_record  │ facial_emb  │ acad_config │ alert_type       │
│ justif_type │ finger_emb  │ sec_config  │ alert            │
│ justification│            │ biometric_case│                │
│ sup_document│             │             │                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Contexto: Identity

**Responsabilidad:** Identidad de personas, credenciales de acceso, sesiones y políticas de contraseña.

| Tabla | Descripción | PK |
|---|---|---|
| `city` | Catálogo de ciudades | `city_id` (INT) |
| `person` | Identidad base: documento, nombre, contacto | `person_id` (UUID) |
| `app_user` | Credenciales de acceso; 1:1 con `person` | `user_id` (UUID) |
| `user_session` | Sesiones activas/cerradas | `session_id` (UUID) |
| `password_policy` | Reglas de complejidad de contraseña | `policy_id` (INT) |

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
| `justification_type` | Catálogo de tipos de justificación | `justification_type_id` (INT) |
| `justification` | Justificación de inasistencia/tardanza | `justification_id` (BIGINT) |
| `supporting_document` | Soportes documentales adjuntos | `supporting_document_id` (BIGINT) |

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

**Responsabilidad:** Plantillas biométricas (facial y dactilar).

**No forma parte del esquema relacional.** Se modela como colecciones NoSQL:

| Colección | Campos clave |
|---|---|
| `facial_embedding` | `person_id`, `template_version`, `encoding`, `model_version`, `is_active` |
| `fingerprint_embedding` | `person_id`, `finger_number`, `template_version`, `encoding`, `model_version`, `is_active` |

**¿Por qué NoSQL?** Los embeddings biométricos son documentos de estructura flexible y de alto volumen de lectura/escritura por reconocimiento en tiempo real.

---

## 9. Contexto: Configuration

**Responsabilidad:** Parámetros configurables y casos de actualización biométrica.

| Tabla | Descripción | PK |
|---|---|---|
| `academic_configuration` | Parámetros por sede | `configuration_id` (INT) |
| `security_configuration` | Parámetros globales de seguridad | `configuration_id` (INT) |
| `biometric_update_case` | Solicitud de actualización biométrica | `case_id` (UUID) |

**`biometric_update_case`** unifica los casos de actualización facial y dactilar:
- `biometric_type`: FACIAL / FINGERPRINT (ENUM)
- `finger_number`: Solo para FINGERPRINT (1..10), nulo para FACIAL
- `current_embedding_ref`: Referencia lógica al documento activo en NoSQL

---

## 10. Contexto: Notification

**Responsabilidad:** Tipos de alerta y alertas generadas sobre actores académicos.

| Tabla | Descripción | PK |
|---|---|---|
| `alert_type` | Catálogo de tipos de alerta | `alert_type_id` (SMALLINT) |
| `alert` | Alerta generada sobre un actor | `alert_id` (BIGINT) |

**Cross-context:**
- `alert.academic_actor_id` → `Academic.academic_actor.academic_actor_id`

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

## 13. ENUMs del modelo

| Dominio | Tipo | Valores |
|---|---|---|
| Identity | `user_session_status` | Active, Closed |
| Identity | `authentication_type` | Local, Windows, External |
| Academic | `enrollment_status` | Active, Withdrawn, Completed |
| Scheduling | `class_session_status` | Open, Closed, Cancelled |
| Attendance | `attendance_status` | Present, Absent, Late, Justified |
| Attendance | `capture_method` | FACIAL, MANUAL, IOT, IMPORT |
| Attendance | `review_status` | Pending, Approved, Rejected |
| Configuration | `biometric_type` | FACIAL, FINGERPRINT |
| Configuration | `update_status` | Pending, In_Review, Approved, Rejected |
