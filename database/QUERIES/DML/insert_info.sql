-- ==================== PROCEDIMIENTO PRINCIPAL ====================

CREATE OR REPLACE PROCEDURE insert_info()
LANGUAGE plpgsql
AS $$
BEGIN
    CALL insert_language();
    CALL insert_person();
    CALL insert_role();
    CALL insert_user();
    CALL insert_user_role();
    CALL insert_module();
    CALL insert_view();
    CALL insert_action();
    CALL insert_role_module();
    CALL insert_view_module();
    CALL insert_view_action();
    CALL insert_course();
    CALL insert_classroom();
    CALL insert_schedule();
    CALL insert_enrollment();
    CALL insert_attendance();
    CALL insert_justification();
    CALL insert_iot_device();
    CALL insert_person_parameters();
END;
$$;


-- ==================== LANGUAGE ====================

CREATE OR REPLACE PROCEDURE insert_language()
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO "Language"(id_language, language_name) VALUES
    (1, 'Español'),
    (2, 'English'),
    (3, 'Français'),
    (4, 'Português'),
    (5, 'Deutsch')
    ON CONFLICT DO NOTHING;
END;
$$;


-- ==================== PERSON ====================

CREATE OR REPLACE PROCEDURE insert_person()
LANGUAGE plpgsql
AS $$
DECLARE
    nombres   TEXT[] := ARRAY['Juan','Maria','Carlos','Laura','Andres','Sofia',
                               'Pedro','Valentina','Daniel','Camila','Mateo','Gabriela',
                               'Luis','Isabella','Santiago','Valeria','Sebastián','Natalia',
                               'Felipe','Alejandra'];
    apellidos TEXT[] := ARRAY['Gomez','Rodriguez','Perez','Martinez','Gonzalez',
                               'Lopez','Hernandez','Diaz','Moreno','Ramirez',
                               'Torres','Vargas','Castro','Ortiz','Ruiz',
                               'Jimenez','Flores','Reyes','Mendoza','Suarez'];
    n TEXT;
    a TEXT;
    num INT;
BEGIN
    FOR i IN 1..1000 LOOP
        n   := nombres  [FLOOR(RANDOM() * array_length(nombres,   1) + 1)::INT];
        a   := apellidos[FLOOR(RANDOM() * array_length(apellidos, 1) + 1)::INT];
        num := FLOOR(RANDOM() * 9000 + 1000)::INT;

        INSERT INTO "Person"(id_person, name, last_name, email, phone, status)
        VALUES (
            i,
            n,
            a,
            LOWER(n || '.' || a || num || '@gmail.com'),
            '3' || LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0'),
            TRUE
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== ROLE ====================

CREATE OR REPLACE PROCEDURE insert_role()
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO "Role"(id_role, name, description) VALUES
    (1, 'Administrador', 'Acceso total al sistema'),
    (2, 'Docente',       'Gestión de cursos y asistencia'),
    (3, 'Estudiante',    'Consulta de horarios y asistencia'),
    (4, 'Supervisor',    'Supervisión y reportes'),
    (5, 'Soporte',       'Soporte técnico del sistema')
    ON CONFLICT DO NOTHING;
END;
$$;


-- ==================== USER ====================

CREATE OR REPLACE PROCEDURE insert_user()
LANGUAGE plpgsql
AS $$
DECLARE
    p RECORD;
    langId INT;
BEGIN
    FOR p IN SELECT id_person FROM "Person" ORDER BY id_person LOOP
        langId := FLOOR(RANDOM() * 5 + 1)::INT;

        INSERT INTO "User"(id_user, id_person, id_language, username, password,
                           status_alerts, is_student, status, created_at, last_login)
        VALUES (
            p.id_person,
            p.id_person,
            langId,
            'user_' || p.id_person,
            'pass_' || p.id_person || FLOOR(RANDOM() * 9000 + 1000)::TEXT,
            (RANDOM() > 0.5),
            (RANDOM() > 0.5),
            TRUE,
            NOW() - (FLOOR(RANDOM() * 365) || ' days')::INTERVAL,
            NOW() - (FLOOR(RANDOM() * 30)  || ' days')::INTERVAL
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== USER_ROLE ====================

CREATE OR REPLACE PROCEDURE insert_user_role()
LANGUAGE plpgsql
AS $$
DECLARE
    u RECORD;
BEGIN
    FOR u IN SELECT id_user FROM "User" ORDER BY id_user LOOP
        INSERT INTO "User_Role"(id_user, id_role, assigned_date)
        VALUES (
            u.id_user,
            FLOOR(RANDOM() * 5 + 1)::INT,
            NOW() - (FLOOR(RANDOM() * 365) || ' days')::INTERVAL
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== MODULE ====================

CREATE OR REPLACE PROCEDURE insert_module()
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO "Module"(id_module, name, description, icon, "order") VALUES
    (1, 'Dashboard',    'Panel principal',             'dashboard',    1),
    (2, 'Usuarios',     'Gestión de usuarios',         'people',       2),
    (3, 'Cursos',       'Gestión de cursos',           'book',         3),
    (4, 'Asistencia',   'Registro de asistencia',      'check_circle', 4),
    (5, 'Horarios',     'Administración de horarios',  'schedule',     5),
    (6, 'Reportes',     'Reportes y estadísticas',     'bar_chart',    6),
    (7, 'Dispositivos', 'Gestión de dispositivos IoT', 'devices',      7),
    (8, 'Roles',        'Gestión de roles y permisos', 'security',     8)
    ON CONFLICT DO NOTHING;
END;
$$;


-- ==================== VIEW ====================

CREATE OR REPLACE PROCEDURE insert_view()
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO "View"(id_view, name, route, title, is_public) VALUES
    (1,  'login',            '/login',               'Iniciar sesión',       TRUE),
    (2,  'dashboard',        '/dashboard',           'Dashboard',            FALSE),
    (3,  'usuarios',         '/usuarios',            'Usuarios',             FALSE),
    (4,  'cursos',           '/cursos',              'Cursos',               FALSE),
    (5,  'asistencia',       '/asistencia',          'Asistencia',           FALSE),
    (6,  'horarios',         '/horarios',            'Horarios',             FALSE),
    (7,  'reportes',         '/reportes',            'Reportes',             FALSE),
    (8,  'dispositivos',     '/dispositivos',        'Dispositivos IoT',     FALSE),
    (9,  'roles',            '/roles',               'Roles',                FALSE),
    (10, 'perfil',           '/perfil',              'Mi Perfil',            FALSE),
    (11, 'justificaciones',  '/justificaciones',     'Justificaciones',      FALSE),
    (12, 'matriculas',       '/matriculas',          'Matrículas',           FALSE)
    ON CONFLICT DO NOTHING;
END;
$$;


-- ==================== ACTION ====================

CREATE OR REPLACE PROCEDURE insert_action()
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO "Action"(id_action, name, description, http_method, enabled) VALUES
    (1, 'Listar',    'Obtener listado de registros', 'GET',    TRUE),
    (2, 'Ver',       'Ver detalle de un registro',   'GET',    TRUE),
    (3, 'Crear',     'Crear un nuevo registro',      'POST',   TRUE),
    (4, 'Editar',    'Editar un registro existente', 'PUT',    TRUE),
    (5, 'Eliminar',  'Eliminar un registro',         'DELETE', TRUE),
    (6, 'Exportar',  'Exportar datos',               'GET',    TRUE),
    (7, 'Importar',  'Importar datos',               'POST',   FALSE),
    (8, 'Aprobar',   'Aprobar una solicitud',        'PATCH',  TRUE)
    ON CONFLICT DO NOTHING;
END;
$$;


-- ==================== ROLE_MODULE ====================

CREATE OR REPLACE PROCEDURE insert_role_module()
LANGUAGE plpgsql
AS $$
BEGIN
    -- Administrador: acceso a todos los módulos
    INSERT INTO "Role_Module"(id_role, id_module)
    SELECT 1, id_module FROM "Module" ON CONFLICT DO NOTHING;

    -- Docente: Dashboard, Cursos, Asistencia, Horarios
    INSERT INTO "Role_Module"(id_role, id_module) VALUES
    (2,1),(2,3),(2,4),(2,5) ON CONFLICT DO NOTHING;

    -- Estudiante: Dashboard, Asistencia, Horarios, Perfil
    INSERT INTO "Role_Module"(id_role, id_module) VALUES
    (3,1),(3,4),(3,5) ON CONFLICT DO NOTHING;

    -- Supervisor: Dashboard, Reportes, Asistencia
    INSERT INTO "Role_Module"(id_role, id_module) VALUES
    (4,1),(4,4),(4,6) ON CONFLICT DO NOTHING;

    -- Soporte: Dashboard, Dispositivos
    INSERT INTO "Role_Module"(id_role, id_module) VALUES
    (5,1),(5,7) ON CONFLICT DO NOTHING;
END;
$$;


-- ==================== VIEW_MODULE ====================

CREATE OR REPLACE PROCEDURE insert_view_module()
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO "View_Module"(id_view, id_module) VALUES
    (1,  1),(2,  1),(3,  2),(4,  3),
    (5,  4),(6,  5),(7,  6),(8,  7),
    (9,  8),(10, 2),(11, 4),(12, 3)
    ON CONFLICT DO NOTHING;
END;
$$;


-- ==================== VIEW_ACTION ====================

CREATE OR REPLACE PROCEDURE insert_view_action()
LANGUAGE plpgsql
AS $$
DECLARE
    v INT;
    ac INT;
BEGIN
    FOR v IN SELECT id_view FROM "View" WHERE is_public = FALSE LOOP
        FOR ac IN 1..8 LOOP
            INSERT INTO "View_Action"(id_view, id_action)
            VALUES (v, ac)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$;


-- ==================== COURSE ====================

CREATE OR REPLACE PROCEDURE insert_course()
LANGUAGE plpgsql
AS $$
DECLARE
    grado INT;
    grupo INT;
    idC   INT := 1;
BEGIN
    FOR grado IN 6..11 LOOP
        FOR grupo IN 1..5 LOOP
            INSERT INTO "Course"(id_course, course_name, course_code)
            VALUES (
                idC,
                'Grado ' || grado || ' - Grupo ' || grupo,
                grado || '0' || grupo
            )
            ON CONFLICT DO NOTHING;
            idC := idC + 1;
        END LOOP;
    END LOOP;
END;
$$;


-- ==================== CLASSROOM ====================

CREATE OR REPLACE PROCEDURE insert_classroom()
LANGUAGE plpgsql
AS $$
DECLARE
    i INT;
BEGIN
    FOR i IN 100..115 LOOP
        INSERT INTO "Classroom"(id_classroom, classroom_name)
        VALUES (i, 'Salón ' || i)
        ON CONFLICT DO NOTHING;
    END LOOP;

    FOR i IN 200..220 LOOP
        INSERT INTO "Classroom"(id_classroom, classroom_name)
        VALUES (i, 'Salón ' || i)
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== SCHEDULE ====================

CREATE OR REPLACE PROCEDURE insert_schedule()
LANGUAGE plpgsql
AS $$
DECLARE
    dias         TEXT[] := ARRAY['Lunes','Martes','Miércoles','Jueves','Viernes'];
    horasInicio  TIME[] := ARRAY['06:00','08:00','10:00','12:00','14:00'];
    horasFin     TIME[] := ARRAY['08:00','10:00','12:00','14:00','16:00'];
    idx          INT;
    teacherId    INT;
    classroomId  INT;
    courseId     INT;
BEGIN
    FOR i IN 1..100 LOOP
        idx := FLOOR(RANDOM() * 5 + 1)::INT;

        SELECT id_teacher    INTO teacherId   FROM "Teacher"   ORDER BY RANDOM() LIMIT 1;
        SELECT id_classroom  INTO classroomId FROM "Classroom" ORDER BY RANDOM() LIMIT 1;
        SELECT id_course     INTO courseId    FROM "Course"    ORDER BY RANDOM() LIMIT 1;

        INSERT INTO "Schedule"(id_schedule, id_course, id_teacher, id_classroom, day, start_time, end_time)
        VALUES (
            i,
            courseId,
            teacherId,
            classroomId,
            dias[idx],
            horasInicio[idx],
            horasFin[idx]
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== ENROLLMENT ====================

CREATE OR REPLACE PROCEDURE insert_enrollment()
LANGUAGE plpgsql
AS $$
DECLARE
    studentId INT;
    courseId  INT;
    estados   TEXT[] := ARRAY['Activo','Inactivo','Pendiente'];
BEGIN
    FOR i IN 1..1000 LOOP
        SELECT id_student INTO studentId FROM "Student"  ORDER BY RANDOM() LIMIT 1;
        SELECT id_course  INTO courseId  FROM "Course"   ORDER BY RANDOM() LIMIT 1;

        INSERT INTO "Enrollment"(id_enrollment, id_student, id_course, enrollment_date, status)
        VALUES (
            i,
            studentId,
            courseId,
            NOW() - (FLOOR(RANDOM() * 365) || ' days')::INTERVAL,
            estados[FLOOR(RANDOM() * 3 + 1)::INT]
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== ATTENDANCE ====================

CREATE OR REPLACE PROCEDURE insert_attendance()
LANGUAGE plpgsql
AS $$
DECLARE
    studentId  INT;
    scheduleId INT;
    estados    TEXT[] := ARRAY['Presente','Ausente','Tardanza','Justificado'];
BEGIN
    FOR i IN 1..1000 LOOP
        SELECT id_student  INTO studentId  FROM "Student"  ORDER BY RANDOM() LIMIT 1;
        SELECT id_schedule INTO scheduleId FROM "Schedule" ORDER BY RANDOM() LIMIT 1;

        INSERT INTO "Attendance"(id_attendance, id_student, id_schedule, date, time, status)
        VALUES (
            i,
            studentId,
            scheduleId,
            CURRENT_DATE - (FLOOR(RANDOM() * 200) || ' days')::INTERVAL,
            (ARRAY['06:05','07:55','08:10','10:00','14:30'])[FLOOR(RANDOM() * 5 + 1)::INT]::TIME,
            estados[FLOOR(RANDOM() * 4 + 1)::INT]
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== JUSTIFICATION ====================

CREATE OR REPLACE PROCEDURE insert_justification()
LANGUAGE plpgsql
AS $$
DECLARE
    attId INT;
    razones TEXT[] := ARRAY[
        'Cita médica', 'Enfermedad', 'Calamidad doméstica',
        'Diligencia personal', 'Evento académico', 'Problema de transporte'
    ];
BEGIN
    FOR i IN 1..200 LOOP
        -- Solo para ausencias o tardanzas
        SELECT id_attendance INTO attId
        FROM "Attendance"
        WHERE status IN ('Ausente','Tardanza')
        ORDER BY RANDOM()
        LIMIT 1;

        IF attId IS NOT NULL THEN
            INSERT INTO "Justification"(id_justification, id_attendance, justification, approval)
            VALUES (
                i,
                attId,
                razones[FLOOR(RANDOM() * array_length(razones,1) + 1)::INT],
                (RANDOM() > 0.3)
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END;
$$;


-- ==================== IoT_Device ====================

CREATE OR REPLACE PROCEDURE insert_iot_device()
LANGUAGE plpgsql
AS $$
DECLARE
    classroomId INT;
    estados     TEXT[] := ARRAY['Activo','Inactivo','Mantenimiento','Falla'];
BEGIN
    FOR i IN 1..50 LOOP
        SELECT id_classroom INTO classroomId FROM "Classroom" ORDER BY RANDOM() LIMIT 1;

        INSERT INTO "IoT_Device"(id_device, device_name, location, status, observation)
        VALUES (
            i,
            CASE FLOOR(RANDOM() * 4)::INT
                WHEN 0 THEN 'Lector Facial #'    || i
                WHEN 1 THEN 'Lector RFID #'      || i
                WHEN 2 THEN 'Cámara IP #'         || i
                ELSE        'Sensor Presencia #'  || i
            END,
            classroomId,
            estados[FLOOR(RANDOM() * 4 + 1)::INT],
            CASE WHEN RANDOM() > 0.7 THEN 'Requiere revisión técnica' ELSE NULL END
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== PERSON_PARAMETERS ====================

CREATE OR REPLACE PROCEDURE insert_person_parameters()
LANGUAGE plpgsql
AS $$
DECLARE
    rasgos TEXT[] := ARRAY[
        'Alto contraste', 'Fuente grande', 'Modo oscuro',
        'Notificaciones activas', 'Vista compacta', 'Idioma secundario'
    ];
    p RECORD;
    i INT := 1;
BEGIN
    FOR p IN
        SELECT id_person FROM "Person"
        WHERE id_person <= 500
        ORDER BY id_person
    LOOP
        INSERT INTO "Person_Parameters"(id_parameters, id_person, traits)
        VALUES (
            i,
            p.id_person,
            rasgos[FLOOR(RANDOM() * array_length(rasgos,1) + 1)::INT]
        )
        ON CONFLICT DO NOTHING;
        i := i + 1;
    END LOOP;
END;
$$;