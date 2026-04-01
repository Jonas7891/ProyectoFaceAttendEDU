-- =============================================================
--  VISTAS — PostgreSQL 18
--  Sistema de registro de asistencia mediante escaneo facial
-- =============================================================


-- -------------------------------------------------------------
--  vw_student_schedule
--  Horario completo de cada estudiante con curso, docente y salón.
--  Filtrada a matrículas activas.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW vw_student_schedule AS
SELECT
    e.id_student,
    p.name || ' ' || p.last_name         AS student_name,
    sc.id_schedule,
    co.course_name,
    co.course_code,
    tp.name || ' ' || tp.last_name       AS teacher_name,
    cl.classroom_name,
    sc.day,
    sc.start_time,
    sc.end_time,
    pe.name                               AS period_name,
    pe.is_active                          AS period_active,
    sch.name                              AS school_name
FROM enrollment e
JOIN person    p   ON e.id_student    = p.id_person
JOIN course    co  ON e.id_course     = co.id_course
JOIN period    pe  ON e.id_period     = pe.id_period
JOIN schedule  sc  ON sc.id_course    = co.id_course
                  AND sc.id_period    = pe.id_period
JOIN person    tp  ON sc.id_teacher   = tp.id_person
JOIN classroom cl  ON sc.id_classroom = cl.id_classroom
JOIN school    sch ON p.id_school     = sch.id_school
WHERE e.status = 'Active';


-- -------------------------------------------------------------
--  vw_teacher_schedule
--  Horario de cada docente con curso, salón y periodo.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW vw_teacher_schedule AS
SELECT
    sc.id_schedule,
    p.id_person                     AS id_teacher,
    p.name || ' ' || p.last_name   AS teacher_name,
    co.course_name,
    co.course_code,
    cl.classroom_name,
    sc.day,
    sc.start_time,
    sc.end_time,
    pe.name                         AS period_name,
    pe.is_active,
    sch.name                        AS school_name
FROM schedule  sc
JOIN person    p   ON sc.id_teacher   = p.id_person
JOIN course    co  ON sc.id_course    = co.id_course
JOIN classroom cl  ON sc.id_classroom = cl.id_classroom
JOIN period    pe  ON sc.id_period    = pe.id_period
JOIN school    sch ON co.id_school    = sch.id_school;


-- -------------------------------------------------------------
--  vw_daily_attendance
--  Registros de asistencia del día actual con contexto completo.
--  Usada por el dashboard en tiempo real.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW vw_daily_attendance AS
SELECT
    a.id_attendance,
    a.date,
    a.time,
    a.status,
    p.id_person                     AS id_student,
    p.name || ' ' || p.last_name   AS student_name,
    co.course_name,
    sc.day,
    sc.start_time,
    sc.end_time,
    cl.classroom_name,
    d.device_name,
    d.ip_address                    AS device_ip,
    sch.id_school,
    sch.name                        AS school_name
FROM attendance a
JOIN person     p   ON a.id_student    = p.id_person
JOIN schedule   sc  ON a.id_schedule   = sc.id_schedule
JOIN course     co  ON sc.id_course    = co.id_course
JOIN classroom  cl  ON sc.id_classroom = cl.id_classroom
JOIN iot_device d   ON a.id_device     = d.id_device
JOIN school     sch ON p.id_school     = sch.id_school
WHERE a.date = CURRENT_DATE;


-- -------------------------------------------------------------
--  vw_attendance_summary
--  Totales de asistencia por estudiante, curso y periodo.
--  Incluye porcentaje de asistencia efectiva.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW vw_attendance_summary AS
SELECT
    p.id_person                     AS id_student,
    p.name || ' ' || p.last_name   AS student_name,
    co.id_course,
    co.course_name,
    pe.id_period,
    pe.name                         AS period_name,
    sch.name                        AS school_name,
    COUNT(*)                        AS total_classes,
    SUM(CASE WHEN a.status = 'Present'   THEN 1 ELSE 0 END) AS present,
    SUM(CASE WHEN a.status = 'Absent'    THEN 1 ELSE 0 END) AS absent,
    SUM(CASE WHEN a.status = 'Late'      THEN 1 ELSE 0 END) AS late,
    SUM(CASE WHEN a.status = 'Justified' THEN 1 ELSE 0 END) AS justified,
    ROUND(
        SUM(CASE WHEN a.status IN ('Present', 'Late', 'Justified') THEN 1 ELSE 0 END)::NUMERIC
        / NULLIF(COUNT(*), 0) * 100, 2
    )                               AS attendance_pct
FROM attendance a
JOIN person    p   ON a.id_student  = p.id_person
JOIN schedule  sc  ON a.id_schedule = sc.id_schedule
JOIN course    co  ON sc.id_course  = co.id_course
JOIN period    pe  ON sc.id_period  = pe.id_period
JOIN school    sch ON p.id_school   = sch.id_school
GROUP BY
    p.id_person, p.name, p.last_name,
    co.id_course, co.course_name,
    pe.id_period, pe.name,
    sch.name;


-- -------------------------------------------------------------
--  vw_pending_justifications
--  Justificaciones pendientes de revisión, ordenadas por antigüedad.
--  Usada por coordinadores para gestionar aprobaciones.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW vw_pending_justifications AS
SELECT
    j.id_justification,
    j.justification,
    j.created_at,
    a.id_attendance,
    a.date          AS attendance_date,
    a.status        AS attendance_status,
    p.id_person     AS id_student,
    p.name || ' ' || p.last_name  AS student_name,
    p.email         AS student_email,
    co.course_name,
    pe.name         AS period_name,
    sch.name        AS school_name
FROM justification j
JOIN attendance a   ON j.id_attendance = a.id_attendance
JOIN person     p   ON a.id_student    = p.id_person
JOIN schedule   sc  ON a.id_schedule   = sc.id_schedule
JOIN course     co  ON sc.id_course    = co.id_course
JOIN period     pe  ON sc.id_period    = pe.id_period
JOIN school     sch ON p.id_school     = sch.id_school
WHERE j.approval = 'Pending'
ORDER BY j.created_at ASC;


-- -------------------------------------------------------------
--  vw_active_facial_embeddings
--  Embeddings vigentes de personas activas.
--  Consultada por el motor de reconocimiento facial en cada escaneo.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW vw_active_facial_embeddings AS
SELECT
    fe.id_embedding,
    fe.id_person,
    p.name || ' ' || p.last_name  AS person_name,
    p.is_student,
    p.is_teacher,
    p.id_school,
    sch.name                       AS school_name,
    fe.embedding,
    fe.model_version
FROM facial_embedding fe
JOIN person p   ON fe.id_person = p.id_person
JOIN school sch ON p.id_school  = sch.id_school
WHERE fe.is_active = TRUE
  AND p.status     = TRUE;


-- -------------------------------------------------------------
--  vw_user_permissions
--  Matriz completa de permisos por usuario: rol → módulo → vista → acción.
--  Excluye roles vencidos y acciones deshabilitadas.
--  Usada por el middleware de autorización.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW vw_user_permissions AS
SELECT
    u.id_user,
    u.username,
    p.name || ' ' || p.last_name  AS full_name,
    r.name                         AS role_name,
    m.name                         AS module_name,
    v.name                         AS view_name,
    v.route,
    v.is_public,
    ac.name                        AS action_name,
    ac.http_method,
    ur.assigned_date,
    ur.expiry_date
FROM "user"     u
JOIN person     p   ON u.id_user    = p.id_person
JOIN user_role  ur  ON u.id_user    = ur.id_user
JOIN role       r   ON ur.id_role   = r.id_role
JOIN role_module rm ON r.id_role    = rm.id_role
JOIN module     m   ON rm.id_module = m.id_module
JOIN view_module vm ON m.id_module  = vm.id_module
JOIN view       v   ON vm.id_view   = v.id_view
JOIN view_action va ON v.id_view    = va.id_view
JOIN action     ac  ON va.id_action = ac.id_action
WHERE u.status  = TRUE
  AND ac.enabled = TRUE
  AND (ur.expiry_date IS NULL OR ur.expiry_date > NOW());


-- -------------------------------------------------------------
--  vw_device_status
--  Estado operativo de cada dispositivo IoT con contexto de
--  salón y escuela. Calcula estado de conexión en tiempo real.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW vw_device_status AS
SELECT
    d.id_device,
    d.device_name,
    d.mac_address,
    d.ip_address,
    d.status,
    d.last_connection,
    d.observation,
    cl.classroom_name,
    sch.id_school,
    sch.name  AS school_name,
    CASE
        WHEN d.last_connection IS NULL                        THEN 'Never connected'
        WHEN d.last_connection < NOW() - INTERVAL '1 hour'   THEN 'Offline'
        ELSE                                                       'Online'
    END       AS connection_status
FROM iot_device d
JOIN classroom cl  ON d.id_classroom = cl.id_classroom
JOIN school    sch ON cl.id_school   = sch.id_school;


-- -------------------------------------------------------------
--  vw_active_enrollments
--  Matrículas activas del periodo vigente por escuela.
--  Usada para verificar si un estudiante tiene derecho a
--  registrar asistencia en un curso.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW vw_active_enrollments AS
SELECT
    e.id_enrollment,
    p.id_person     AS id_student,
    p.name || ' ' || p.last_name  AS student_name,
    p.email,
    co.id_course,
    co.course_name,
    co.course_code,
    pe.id_period,
    pe.name         AS period_name,
    e.enrollment_date,
    e.status,
    sch.id_school,
    sch.name        AS school_name
FROM enrollment e
JOIN person  p   ON e.id_student  = p.id_person
JOIN course  co  ON e.id_course   = co.id_course
JOIN period  pe  ON e.id_period   = pe.id_period
JOIN school  sch ON co.id_school  = sch.id_school
WHERE e.status   = 'Active'
  AND pe.is_active = TRUE;