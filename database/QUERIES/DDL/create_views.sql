-- Vista Person
CREATE OR REPLACE VIEW
    view_person AS
SELECT
    *
FROM
    "Person";

-- Vista Role
CREATE OR REPLACE VIEW
    view_role AS
SELECT
    *
FROM
    "Role";

-- Vista Language
CREATE OR REPLACE VIEW
    view_language AS
SELECT
    *
FROM
    "Language";

-- Vista Module
CREATE OR REPLACE VIEW
    view_module AS
SELECT
    *
FROM
    "Module";

-- Vista View
CREATE OR REPLACE VIEW
    view_view AS
SELECT
    *
FROM
    "View";

-- Vista Action
CREATE OR REPLACE VIEW
    view_action AS
SELECT
    *
FROM
    "Action";

-- Vista Course
CREATE OR REPLACE VIEW
    view_course AS
SELECT
    *
FROM
    "Course";

-- Vista Classroom
CREATE OR REPLACE VIEW
    view_classroom AS
SELECT
    *
FROM
    "Classroom";

-- Vista IoT_Device
CREATE OR REPLACE VIEW
    view_iot_device AS
SELECT
    d.id_device,
    d.device_name,
    d.status,
    d.observation,
    -- Salon donde está ubicado
    c.id_classroom AS idSalon,
    c.classroom_name AS salonNombre
FROM
    "IoT_Device" d
    JOIN "Classroom" c ON d.location = c.id_classroom;

-- Vista Person_Parameters
CREATE OR REPLACE VIEW
    view_person_parameters AS
SELECT
    pp.id_parameters,
    pp.traits,
    -- Datos de la persona
    p.id_person AS idPersona,
    p.name AS nombre,
    p.last_name AS apellidos,
    p.email AS correo
FROM
    "Person_Parameters" pp
    JOIN "Person" p ON pp.id_person = p.id_person;


-- Vista User
CREATE OR REPLACE VIEW
    view_user AS
SELECT
    u.id_user,
    u.username,
    u.status_alerts AS alertasActivas,
    u.is_student AS esEstudiante,
    u.status AS estado,
    u.created_at AS fechaCreacion,
    u.last_login AS ultimoAcceso,
    -- Datos personales
    p.id_person AS idPersona,
    p.name AS nombre,
    p.last_name AS apellidos,
    p.email AS correo,
    p.phone AS telefono,
    -- Idioma
    l.id_language AS idIdioma,
    l.language_name AS idioma
FROM
    "User" u
    JOIN "Person" p ON u.id_person = p.id_person
    JOIN "Language" l ON u.id_language = l.id_language;

-- Vista Schedule
CREATE OR REPLACE VIEW
    view_schedule AS
SELECT
    sch.id_schedule,
    sch.day AS dia,
    sch.start_time AS horaInicio,
    sch.end_time AS horaFin,
    -- Curso
    c.id_course AS idCurso,
    c.course_name AS cursoNombre,
    c.course_code AS cursoCodigo,
    -- Docente
    t.id_teacher AS idDocente,
    p.name AS docenteNombre,
    p.last_name AS docenteApellidos,
    -- Salon
    cl.id_classroom AS idSalon,
    cl.classroom_name AS salonNombre
FROM
    "Schedule" sch
    JOIN "Course" c ON sch.id_course = c.id_course
    JOIN "Teacher" t ON sch.id_teacher = t.id_teacher
    JOIN "Person" p ON t.id_person = p.id_person
    JOIN "Classroom" cl ON sch.id_classroom = cl.id_classroom;

-- Vista Enrollment
CREATE OR REPLACE VIEW
    view_enrollment AS
SELECT
    e.id_enrollment,
    e.enrollment_date AS fechaMatricula,
    e.status AS estado,
    -- Estudiante
    s.id_student AS idEstudiante,
    p.name AS estudianteNombre,
    p.last_name AS estudianteApellidos,
    p.email AS estudianteCorreo,
    -- Curso
    c.id_course AS idCurso,
    c.course_name AS cursoNombre,
    c.course_code AS cursoCodigo
FROM
    "Enrollment" e
    JOIN "Student" s ON e.id_student = s.id_student
    JOIN "Person" p ON s.id_person = p.id_person
    JOIN "Course" c ON e.id_course = c.id_course;

-- Vista Attendance
CREATE OR REPLACE VIEW
    view_attendance AS
SELECT
    a.id_attendance,
    a.date AS fecha,
    a.time AS hora,
    a.status AS estado,
    -- Estudiante
    s.id_student AS idEstudiante,
    p.name AS estudianteNombre,
    p.last_name AS estudianteApellidos,
    -- Horario
    sch.id_schedule AS idHorario,
    sch.day AS dia,
    sch.start_time AS horaInicio,
    sch.end_time AS horaFin,
    -- Curso
    c.id_course AS idCurso,
    c.course_name AS cursoNombre,
    -- Docente
    t.id_teacher AS idDocente,
    pd.name AS docenteNombre,
    pd.last_name AS docenteApellidos
FROM
    "Attendance" a
    JOIN "Student" s ON a.id_student = s.id_student
    JOIN "Person" p ON s.id_person = p.id_person
    JOIN "Schedule" sch ON a.id_schedule = sch.id_schedule
    JOIN "Course" c ON sch.id_course = c.id_course
    JOIN "Teacher" t ON sch.id_teacher = t.id_teacher
    JOIN "Person" pd ON t.id_person = pd.id_person;

-- Vista Justification
CREATE OR REPLACE VIEW
    view_justification AS
SELECT
    j.id_justification,
    j.justification AS justificacion,
    j.approval AS aprobado,
    -- Asistencia
    a.id_attendance AS idAsistencia,
    a.date AS fecha,
    a.status AS estadoAsistencia,
    -- Estudiante
    s.id_student AS idEstudiante,
    p.name AS estudianteNombre,
    p.last_name AS estudianteApellidos
FROM
    "Justification" j
    JOIN "Attendance" a ON j.id_attendance = a.id_attendance
    JOIN "Student" s ON a.id_student = s.id_student
    JOIN "Person" p ON s.id_person = p.id_person;