# Registros Predefinidos — FaceAttend-Edu

## 1. Visión general

Estos registros se crean automáticamente al ejecutar las migraciones Liquibase (`docker compose up`). Son datos **semilla** (seeds) para tablas catálogo que el negocio necesita para funcionar desde el primer momento.

Todos los seeds se ejecutan con `context: seed`, lo que permite excluirlos si se desea ejecutar solo la estructura.

---

## 2. Identity — `identity.city`

Ciudades principales de Colombia. Referenciadas por `academic.school.city_id`.

| ID | Nombre | Departamento |
|----|--------|--------------|
| 1 | Bogotá | Cundinamarca |
| 2 | Medellín | Antioquia |
| 3 | Cali | Valle del Cauca |
| 4 | Barranquilla | Atlántico |
| 5 | Cartagena | Bolívar |

**Archivo:** `01-ms-identity-db/02-dml/001-seed-city-table.yaml`

**Uso:** Al registrar una nueva sede (`school`), se asigna una `city_id` de este catálogo.

---

## 3. Authorization — `authorization.role`

Roles del sistema RBAC. Cada usuario recibe uno o más roles vía `user_role`.

| ID | Rol | Descripción |
|----|-----|-------------|
| 1 | `SUPER_ADMIN` | Super administrador del sistema |
| 2 | `SCHOOL_ADMIN` | Administrador de sede |
| 3 | `INSTRUCTOR` | Docente/Instructor |
| 4 | `STUDENT` | Estudiante/Aprendiz |

**Archivo:** `02-ms-authorization-db/02-dml/001-seed-role-table.yaml`

**Uso:** Al crear un usuario, se le asigna al menos un rol. El rol determina los permisos que tiene.

---

## 4. Authorization — `authorization.permission`

Permisos atómicos del sistema. Se asignan a roles vía `role_permission`.

| ID | Permiso | Descripción |
|----|---------|-------------|
| 1 | `person.create` | Crear personas |
| 2 | `person.read` | Consultar personas |
| 3 | `person.update` | Actualizar personas |
| 4 | `person.delete` | Eliminar personas |
| 5 | `school.create` | Crear sedes |
| 6 | `school.read` | Consultar sedes |
| 7 | `school.update` | Actualizar sedes |
| 8 | `enrollment.create` | Crear matrículas |
| 9 | `enrollment.read` | Consultar matrículas |
| 10 | `attendance.read` | Consultar asistencias |
| 11 | `attendance.update` | Actualizar asistencias |
| 12 | `justification.approve` | Aprobar justificaciones |
| 13 | `biometric.update` | Solicitar actualización biométrica |
| 14 | `configuration.manage` | Gestionar configuración |

**Archivo:** `02-ms-authorization-db/02-dml/002-seed-permission-table.yaml`

**Uso:** Los permisos se agrupan en roles. Ejemplo: el rol `INSTRUCTOR` podría tener `attendance.read`, `attendance.update` y `justification.approve`.

### Matriz sugerida de roles × permisos

| Permiso | SUPER_ADMIN | SCHOOL_ADMIN | INSTRUCTOR | STUDENT |
|---------|:-----------:|:------------:|:----------:|:-------:|
| `person.create` | ✅ | ✅ | ❌ | ❌ |
| `person.read` | ✅ | ✅ | ✅ | ✅ |
| `person.update` | ✅ | ✅ | ❌ | ❌ |
| `person.delete` | ✅ | ❌ | ❌ | ❌ |
| `school.create` | ✅ | ❌ | ❌ | ❌ |
| `school.read` | ✅ | ✅ | ✅ | ✅ |
| `school.update` | ✅ | ✅ | ❌ | ❌ |
| `enrollment.create` | ✅ | ✅ | ❌ | ❌ |
| `enrollment.read` | ✅ | ✅ | ✅ | ✅ |
| `attendance.read` | ✅ | ✅ | ✅ | ✅ |
| `attendance.update` | ✅ | ✅ | ✅ | ❌ |
| `justification.approve` | ✅ | ✅ | ✅ | ❌ |
| `biometric.update` | ✅ | ✅ | ✅ | ✅ |
| `configuration.manage` | ✅ | ❌ | ❌ | ❌ |

> **Nota:** Esta matriz es una sugerencia. La asignación real se hace vía `role_permission` y puede personalizarse.

---

## 5. Academic — `academic.academic_actor_type`

Tipos de actor académico. Determina si una persona es estudiante o instructor dentro de una sede.

| ID | Código | Nombre |
|----|--------|--------|
| 1 | `STUDENT` | Estudiante/Aprendiz |
| 2 | `INSTRUCTOR` | Docente/Instructor |

**Archivo:** `03-ms-academic-db/02-dml/001-seed-academic-actor-type-table.yaml`

**Uso:** Al registrar un `academic_actor`, se especifica el `actor_type_id` para indicar si es estudiante o instructor. La misma `person` puede ser instructor en una sede y estudiante en otra.

---

## 6. Attendance — `attendance.justification_type`

Tipos de justificación para inasistencias o tardanzas.

| ID | Nombre | Descripción | Requiere adjunto |
|----|--------|-------------|:----------------:|
| 1 | Incapacidad médica | Justificación por incapacidad médica certificada | ✅ Sí |
| 2 | Calamidad doméstica | Justificación por calamidad doméstica | ✅ Sí |
| 3 | Cita médica | Justificación por cita médica programada | ✅ Sí |
| 4 | Compromiso académico | Justificación por actividad académica externa | ❌ No |
| 5 | Permiso personal | Justificación por permiso personal del aprendiz | ❌ No |

**Archivo:** `05-ms-attendance-db/02-dml/001-seed-justification-type-table.yaml`

**Uso:** Al crear una `justification`, se selecciona el tipo. Si `requires_attachment = true`, el sistema debe exigir un `supporting_document` adjunto.

---

## 7. Configuration — `configuration.security_configuration`

Parámetros globales de seguridad del sistema.

| ID | Parámetro | Valor | Descripción |
|----|-----------|-------|-------------|
| 1 | `session_timeout_minutes` | `480` | Tiempo máximo de sesión en minutos (8 horas) |
| 2 | `max_login_attempts` | `5` | Número máximo de intentos de login antes de bloqueo |
| 3 | `lockout_duration_minutes` | `30` | Duración del bloqueo tras intentos fallidos |
| 4 | `password_min_length` | `8` | Longitud mínima de contraseña |
| 5 | `require_password_change` | `true` | Requerir cambio de contraseña en primer login |

**Archivo:** `07-ms-configuration-db/02-dml/001-seed-security-configuration-table.yaml`

**Uso:** La aplicación lee estos valores al iniciar para configurar la política de seguridad. Son editables por un `SUPER_ADMIN` vía la tabla `security_configuration`.

---

## 8. Notification — `notification.alert_type`

Tipos de alerta que el sistema puede generar automáticamente.

| ID | Código | Nombre |
|----|--------|--------|
| 1 | `ABSENTEEISM` | Ausentismo recurrente |
| 2 | `REPEATED_TARDINESS` | Tardanzas repetidas |
| 3 | `LOW_ATTENDANCE` | Bajo porcentaje de asistencia |
| 4 | `JUSTIFICATION_PENDING` | Justificación pendiente de revisión |
| 5 | `BIOMETRIC_UPDATE` | Solicitud de actualización biométrica |

**Archivo:** `08-ms-notification-db/02-dml/001-seed-alert-type-table.yaml`

**Uso:** Cuando el sistema detecta una condición (ej: un estudiante faltó 3 veces seguidas), genera un `alert` con el `alert_type_id` correspondiente.

---

## 9. Resumen por dominio

| Dominio | Tabla catálogo | Registros | Archivo seed |
|---------|---------------|:---------:|--------------|
| Identity | `city` | 5 | `01-ms-identity-db/02-dml/001-seed-city-table.yaml` |
| Authorization | `role` | 4 | `02-ms-authorization-db/02-dml/001-seed-role-table.yaml` |
| Authorization | `permission` | 14 | `02-ms-authorization-db/02-dml/002-seed-permission-table.yaml` |
| Academic | `academic_actor_type` | 2 | `03-ms-academic-db/02-dml/001-seed-academic-actor-type-table.yaml` |
| Attendance | `justification_type` | 5 | `05-ms-attendance-db/02-dml/001-seed-justification-type-table.yaml` |
| Configuration | `security_configuration` | 5 | `07-ms-configuration-db/02-dml/001-seed-security-configuration-table.yaml` |
| Notification | `alert_type` | 5 | `08-ms-notification-db/02-dml/001-seed-alert-type-table.yaml` |

**Total: 40 registros semilla en 7 tablas catálogo.**

---

## 10. Cómo agregar nuevos registros

Los seeds se ejecutan una sola vez al crear la BD. Para agregar nuevos registros después de la inicialización, usar SQL directo o crear un nuevo archivo DML con un changeset incremental:

```yaml
databaseChangeLog:
  - changeSet:
      id: 002-add-new-cities
      author: TuNombre
      changes:
        - insert:
            tableName: city
            schemaName: identity
            columns:
              - column: { name: city_id, value: 6 }
              - column: { name: name, value: 'Bucaramanga' }
              - column: { name: department, value: 'Santander' }
              - column: { name: created_at, valueDate: { dateFunction: now } }
              - column: { name: updated_at, valueDate: { dateFunction: now } }
              - column: { name: row_version, value: 1 }
```

> **Importante:** Nunca modificar los changesets de seeds existentes una vez ejecutados en producción. Siempre agregar nuevos changesets incrementales.

---

## 11. Tablas con ENUMs (no seeds)

Las siguientes tablas usan **tipos ENUM de PostgreSQL** en lugar de tablas catálogo. Sus valores están definidos en `02-types/` y se crean automáticamente:

| Dominio | Tipo ENUM | Valores |
|---------|-----------|---------|
| Identity | `user_session_status` | Active, Closed |
| Identity | `authentication_type` | Local, Windows, External |
| Academic | `enrollment_status` | Active, Withdrawn, Completed |
| Scheduling | `class_session_status` | Open, Closed, Cancelled |
| Attendance | `attendance_status` | Present, Absent, Late, Justified |
| Attendance | `capture_method` | FACIAL, MANUAL, IOT, IMPORT |
| Attendance | `review_status` | Pending, Approved, Rejected |
| Configuration | `biometric_type` | FACIAL, FINGERPRINT |
| Configuration | `update_status` | Pending, In_Review, Approved, Rejected |

Estos valores **no se insertan** como registros; son parte del tipo de datos PostgreSQL y se validan a nivel de esquema.
