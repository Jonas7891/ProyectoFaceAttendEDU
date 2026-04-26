-- =============================================================
--  DATOS DE PRUEBA — PostgreSQL 18
--  Sistema de registro de asistencia mediante escaneo facial
--
--  Volumen generado:
--    5  escuelas    | 10 periodos (2 por escuela)
--   100 docentes    | 900 estudiantes
--  1000 usuarios    | 150 cursos (30 por escuela)
--   100 salones     |  50 dispositivos IoT
--   ~150 horarios   | ~2000 matrículas
--  ~3000 asistencias| ~500 justificaciones
--  1000 embeddings faciales
-- =============================================================


-- ==================== ORQUESTADOR ====================

CREATE OR REPLACE PROCEDURE insert_info()
LANGUAGE plpgsql AS $$
BEGIN
    CALL insert_school();
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
    CALL insert_period();
    CALL insert_schedule();
    CALL insert_enrollment();
    CALL insert_iot_device();
    CALL insert_attendance();
    CALL insert_justification();
    CALL insert_facial_embedding();
END;
$$;


-- ==================== SCHOOL ====================

CREATE OR REPLACE PROCEDURE insert_school()
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO school (id_school, name, nit, address, phone, email, status, created_at) VALUES
    (1, 'Colegio San José',          '900123456-1', 'Calle 10 #5-20, Bogotá',         '3101234567', 'info@sanjose.edu.co',          TRUE, NOW()),
    (2, 'Instituto Técnico Central', '900234567-2', 'Carrera 15 #8-30, Medellín',      '3112345678', 'info@itcentral.edu.co',         TRUE, NOW()),
    (3, 'Liceo Moderno',             '900345678-3', 'Avenida 3 #12-15, Cali',          '3123456789', 'info@liceomoderno.edu.co',      TRUE, NOW()),
    (4, 'Colegio Los Andes',         '900456789-4', 'Calle 25 #7-10, Barranquilla',    '3134567890', 'info@losandes.edu.co',          TRUE, NOW()),
    (5, 'Escuela Nueva Esperanza',   '900567890-5', 'Carrera 8 #20-5, Bucaramanga',    '3145678901', 'info@nuevaesperanza.edu.co',    TRUE, NOW())
    ON CONFLICT DO NOTHING;
END;
$$;


-- ==================== PERSON ====================
-- Persons 1-100   → docentes (is_teacher = TRUE)
-- Persons 101-1000 → estudiantes (is_student = TRUE)
-- Escuela asignada por round-robin: ((i-1) % 5) + 1

CREATE OR REPLACE PROCEDURE insert_person()
LANGUAGE plpgsql AS $$
DECLARE
    nombres   TEXT[] := ARRAY['Juan','Maria','Carlos','Laura','Andres','Sofia',
                               'Pedro','Valentina','Daniel','Camila','Mateo','Gabriela',
                               'Luis','Isabella','Santiago','Valeria','Sebastian','Natalia',
                               'Felipe','Alejandra'];
    apellidos TEXT[] := ARRAY['Gomez','Rodriguez','Perez','Martinez','Gonzalez',
                               'Lopez','Hernandez','Diaz','Moreno','Ramirez',
                               'Torres','Vargas','Castro','Ortiz','Ruiz',
                               'Jimenez','Flores','Reyes','Mendoza','Suarez'];
    n        TEXT;
    a        TEXT;
    num      INT;
    schoolId INT;
BEGIN
    FOR i IN 1..1000 LOOP
        n        := nombres  [FLOOR(RANDOM() * array_length(nombres,   1) + 1)::INT];
        a        := apellidos[FLOOR(RANDOM() * array_length(apellidos, 1) + 1)::INT];
        num      := FLOOR(RANDOM() * 9000 + 1000)::INT;
        schoolId := ((i - 1) % 5) + 1;

        INSERT INTO person (id_person, id_school, name, last_name, email, phone,
                            is_student, is_teacher, status, created_at)
        VALUES (
            i,
            schoolId,
            n,
            a,
            LOWER(n || '.' || a || num || '@gmail.com'),
            '3' || LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0'),
            (i > 100),    -- estudiante
            (i <= 100),   -- docente
            TRUE,
            NOW() - (FLOOR(RANDOM() * 365) || ' days')::INTERVAL
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== ROLE ====================

CREATE OR REPLACE PROCEDURE insert_role()
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO role (id_role, name, description) VALUES
    (1, 'Administrador', 'Acceso total al sistema'),
    (2, 'Docente',       'Gestión de cursos y asistencia'),
    (3, 'Estudiante',    'Consulta de horarios y asistencia'),
    (4, 'Supervisor',    'Supervisión y reportes'),
    (5, 'Soporte',       'Soporte técnico del sistema')
    ON CONFLICT DO NOTHING;
END;
$$;


-- ==================== USER ====================
-- Contraseña hasheada con MD5 (solo datos de prueba)

CREATE OR REPLACE PROCEDURE insert_user()
LANGUAGE plpgsql AS $$
DECLARE
    p      RECORD;
BEGIN
    FOR p IN SELECT id_person FROM person ORDER BY id_person LOOP

        INSERT INTO "user" (id_user, id_person, username, password,
                            status, created_at, last_login)
        VALUES (
            p.id_person,
            p.id_person,
            'user_' || p.id_person,
            md5('pass_' || p.id_person || FLOOR(RANDOM() * 9000 + 1000)::TEXT),
            TRUE,
            NOW() - (FLOOR(RANDOM() * 365) || ' days')::INTERVAL,
            NOW() - (FLOOR(RANDOM() * 30)  || ' days')::INTERVAL
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== USER_ROLE ====================
-- Docentes (1-100) → rol 2; Estudiantes (101-1000) → rol 3;
-- Primeros 5 usuarios → Administradores

CREATE OR REPLACE PROCEDURE insert_user_role()
LANGUAGE plpgsql AS $$
DECLARE
    u      RECORD;
    roleId INT;
BEGIN
    FOR u IN SELECT id_user FROM "user" ORDER BY id_user LOOP
        roleId := CASE
            WHEN u.id_user <= 5   THEN 1  -- Administrador
            WHEN u.id_user <= 100 THEN 2  -- Docente
            ELSE                       3  -- Estudiante
        END;

        INSERT INTO user_role (id_user, id_role, assigned_date, expiry_date)
        VALUES (
            u.id_user,
            roleId,
            NOW() - (FLOOR(RANDOM() * 365) || ' days')::INTERVAL,
            NULL  -- rol vigente
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== MODULE ====================

CREATE OR REPLACE PROCEDURE insert_module()
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO module (id_module, name, description, icon, "order") VALUES
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
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO view (id_view, name, route, title, is_public) VALUES
    (1,  'login',           '/login',           'Iniciar sesión',   TRUE),
    (2,  'dashboard',       '/dashboard',       'Dashboard',        FALSE),
    (3,  'usuarios',        '/usuarios',        'Usuarios',         FALSE),
    (4,  'cursos',          '/cursos',          'Cursos',           FALSE),
    (5,  'asistencia',      '/asistencia',      'Asistencia',       FALSE),
    (6,  'horarios',        '/horarios',        'Horarios',         FALSE),
    (7,  'reportes',        '/reportes',        'Reportes',         FALSE),
    (8,  'dispositivos',    '/dispositivos',    'Dispositivos IoT', FALSE),
    (9,  'roles',           '/roles',           'Roles',            FALSE),
    (10, 'perfil',          '/perfil',          'Mi Perfil',        FALSE),
    (11, 'justificaciones', '/justificaciones', 'Justificaciones',  FALSE),
    (12, 'matriculas',      '/matriculas',      'Matrículas',       FALSE)
    ON CONFLICT DO NOTHING;
END;
$$;


-- ==================== ACTION ====================

CREATE OR REPLACE PROCEDURE insert_action()
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO action (id_action, name, description, http_method, enabled) VALUES
    (1, 'Listar',   'Obtener listado de registros', 'GET',    TRUE),
    (2, 'Ver',      'Ver detalle de un registro',   'GET',    TRUE),
    (3, 'Crear',    'Crear un nuevo registro',      'POST',   TRUE),
    (4, 'Editar',   'Editar un registro existente', 'PUT',    TRUE),
    (5, 'Eliminar', 'Eliminar un registro',         'DELETE', TRUE),
    (6, 'Exportar', 'Exportar datos a archivo',     'GET',    TRUE),
    (7, 'Importar', 'Importar datos desde archivo', 'POST',   FALSE),
    (8, 'Aprobar',  'Aprobar una solicitud',        'PATCH',  TRUE)
    ON CONFLICT DO NOTHING;
END;
$$;


-- ==================== ROLE_MODULE ====================

CREATE OR REPLACE PROCEDURE insert_role_module()
LANGUAGE plpgsql AS $$
BEGIN
    -- Administrador: todos los módulos
    INSERT INTO role_module (id_role, id_module)
    SELECT 1, id_module FROM module ON CONFLICT DO NOTHING;

    -- Docente: Dashboard, Cursos, Asistencia, Horarios, Reportes
    INSERT INTO role_module (id_role, id_module) VALUES
    (2,1),(2,3),(2,4),(2,5),(2,6) ON CONFLICT DO NOTHING;

    -- Estudiante: Dashboard, Asistencia, Horarios, Perfil
    INSERT INTO role_module (id_role, id_module) VALUES
    (3,1),(3,4),(3,5) ON CONFLICT DO NOTHING;

    -- Supervisor: Dashboard, Asistencia, Reportes
    INSERT INTO role_module (id_role, id_module) VALUES
    (4,1),(4,4),(4,6) ON CONFLICT DO NOTHING;

    -- Soporte: Dashboard, Dispositivos
    INSERT INTO role_module (id_role, id_module) VALUES
    (5,1),(5,7) ON CONFLICT DO NOTHING;
END;
$$;


-- ==================== VIEW_MODULE ====================

CREATE OR REPLACE PROCEDURE insert_view_module()
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO view_module (id_view, id_module) VALUES
    (1,  1), (2,  1), (3,  2), (4,  3),
    (5,  4), (6,  5), (7,  6), (8,  7),
    (9,  8), (10, 2), (11, 4), (12, 3)
    ON CONFLICT DO NOTHING;
END;
$$;


-- ==================== VIEW_ACTION ====================
-- Todas las vistas privadas reciben todas las acciones

CREATE OR REPLACE PROCEDURE insert_view_action()
LANGUAGE plpgsql AS $$
DECLARE
    v  RECORD;
    ac RECORD;
BEGIN
    FOR v IN SELECT id_view FROM view WHERE is_public = FALSE LOOP
        FOR ac IN SELECT id_action FROM action LOOP
            INSERT INTO view_action (id_view, id_action)
            VALUES (v.id_view, ac.id_action)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$;


-- ==================== COURSE ====================
-- 30 cursos por escuela (grados 6–11, grupos 1–5) = 150 total

CREATE OR REPLACE PROCEDURE insert_course()
LANGUAGE plpgsql AS $$
DECLARE
    grado    INT;
    grupo    INT;
    idC      INT := 1;
    schoolId INT;
BEGIN
    FOR schoolId IN 1..5 LOOP
        FOR grado IN 6..11 LOOP
            FOR grupo IN 1..5 LOOP
                INSERT INTO course (id_course, id_school, course_name, course_code)
                VALUES (
                    idC,
                    schoolId,
                    'Grado ' || grado || ' - Grupo ' || grupo,
                    schoolId || '-' || grado || '0' || grupo
                )
                ON CONFLICT DO NOTHING;
                idC := idC + 1;
            END LOOP;
        END LOOP;
    END LOOP;
END;
$$;


-- ==================== CLASSROOM ====================
-- 20 salones por escuela = 100 total

CREATE OR REPLACE PROCEDURE insert_classroom()
LANGUAGE plpgsql AS $$
DECLARE
    idCl     INT := 1;
    schoolId INT;
    piso     INT;
    sala     INT;
BEGIN
    FOR schoolId IN 1..5 LOOP
        FOR piso IN 1..2 LOOP
            FOR sala IN 1..10 LOOP
                INSERT INTO classroom (id_classroom, id_school, classroom_name)
                VALUES (idCl, schoolId, 'Salón ' || piso || LPAD(sala::TEXT, 2, '0'))
                ON CONFLICT DO NOTHING;
                idCl := idCl + 1;
            END LOOP;
        END LOOP;
    END LOOP;
END;
$$;


-- ==================== PERIOD ====================
-- 2 periodos por escuela (1 histórico + 1 activo) = 10 total

CREATE OR REPLACE PROCEDURE insert_period()
LANGUAGE plpgsql AS $$
DECLARE
    schoolId INT;
BEGIN
    FOR schoolId IN 1..5 LOOP
        INSERT INTO period (id_period, id_school, name, start_date, end_date, is_active) VALUES
        -- Periodo histórico
        (schoolId * 2 - 1, schoolId, '2024-1', '2024-01-15', '2024-06-30', FALSE),
        -- Periodo activo
        (schoolId * 2,     schoolId, '2025-1', '2025-01-13', '2025-06-27', TRUE)
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== SCHEDULE ====================
-- ~30 horarios por escuela usando docentes y salones de la misma escuela

CREATE OR REPLACE PROCEDURE insert_schedule()
LANGUAGE plpgsql AS $$
DECLARE
    dias        days_enum[] := ARRAY['Lunes','Martes','Miercoles','Jueves','Viernes']::days_enum[];
    inicios     TIME[]      := ARRAY['06:00','08:00','10:00','12:00','14:00']::TIME[];
    fines       TIME[]      := ARRAY['08:00','10:00','12:00','14:00','16:00']::TIME[];
    schoolId    INT;
    teacherId   INT;
    classroomId INT;
    courseId    INT;
    periodId    INT;
    slotIdx     INT;
    idS         INT := 1;
BEGIN
    FOR schoolId IN 1..5 LOOP
        SELECT id_period INTO periodId
        FROM period
        WHERE id_school = schoolId AND is_active = TRUE
        LIMIT 1;

        FOR i IN 1..40 LOOP
            SELECT id_person INTO teacherId
            FROM person
            WHERE id_school = schoolId AND is_teacher = TRUE
            ORDER BY RANDOM() LIMIT 1;

            SELECT id_classroom INTO classroomId
            FROM classroom
            WHERE id_school = schoolId
            ORDER BY RANDOM() LIMIT 1;

            SELECT id_course INTO courseId
            FROM course
            WHERE id_school = schoolId
            ORDER BY RANDOM() LIMIT 1;

            slotIdx := FLOOR(RANDOM() * 5 + 1)::INT;

            INSERT INTO schedule (id_schedule, id_period, id_course, id_teacher,
                                  id_classroom, day, start_time, end_time)
            VALUES (
                idS,
                periodId,
                courseId,
                teacherId,
                classroomId,
                dias   [FLOOR(RANDOM() * 5 + 1)::INT],
                inicios[slotIdx],
                fines  [slotIdx]
            )
            ON CONFLICT DO NOTHING;

            idS := idS + 1;
        END LOOP;
    END LOOP;
END;
$$;


-- ==================== ENROLLMENT ====================
-- ~2000 matrículas respetando escuela del estudiante y del curso

CREATE OR REPLACE PROCEDURE insert_enrollment()
LANGUAGE plpgsql AS $$
DECLARE
    studentId  INT;
    courseId   INT;
    periodId   INT;
    schoolId   INT;
    statuses   enrollment_status_enum[] :=
        ARRAY['Active','Active','Active','Withdrawn','Completed']::enrollment_status_enum[];
BEGIN
    FOR i IN 1..2000 LOOP
        schoolId := FLOOR(RANDOM() * 5 + 1)::INT;

        SELECT id_person INTO studentId
        FROM person
        WHERE id_school = schoolId AND is_student = TRUE
        ORDER BY RANDOM() LIMIT 1;

        SELECT id_course INTO courseId
        FROM course
        WHERE id_school = schoolId
        ORDER BY RANDOM() LIMIT 1;

        SELECT id_period INTO periodId
        FROM period
        WHERE id_school = schoolId AND is_active = TRUE
        LIMIT 1;

        CONTINUE WHEN studentId IS NULL OR courseId IS NULL OR periodId IS NULL;

        INSERT INTO enrollment (id_enrollment, id_student, id_course, id_period,
                                enrollment_date, status)
        VALUES (
            i,
            studentId,
            courseId,
            periodId,
            NOW() - (FLOOR(RANDOM() * 180) || ' days')::INTERVAL,
            statuses[FLOOR(RANDOM() * 5 + 1)::INT]
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== IOT_DEVICE ====================
-- 50 dispositivos distribuidos en salones existentes

CREATE OR REPLACE PROCEDURE insert_iot_device()
LANGUAGE plpgsql AS $$
DECLARE
    classroomId INT;
    mac         TEXT;
BEGIN
    FOR i IN 1..50 LOOP
        SELECT id_classroom INTO classroomId
        FROM classroom ORDER BY RANDOM() LIMIT 1;

        -- MAC address en formato XX:XX:XX:XX:XX:XX
        mac := UPPER(
            LPAD(TO_HEX(FLOOR(RANDOM() * 256)::INT), 2, '0') || ':' ||
            LPAD(TO_HEX(FLOOR(RANDOM() * 256)::INT), 2, '0') || ':' ||
            LPAD(TO_HEX(FLOOR(RANDOM() * 256)::INT), 2, '0') || ':' ||
            LPAD(TO_HEX(FLOOR(RANDOM() * 256)::INT), 2, '0') || ':' ||
            LPAD(TO_HEX(FLOOR(RANDOM() * 256)::INT), 2, '0') || ':' ||
            LPAD(TO_HEX(FLOOR(RANDOM() * 256)::INT), 2, '0')
        );

        INSERT INTO iot_device (id_device, id_classroom, device_name, mac_address,
                                ip_address, status, last_connection, observation)
        VALUES (
            i,
            classroomId,
            CASE FLOOR(RANDOM() * 3)::INT
                WHEN 0 THEN 'Lector Facial #'   || i
                WHEN 1 THEN 'Cámara IP #'        || i
                ELSE        'Sensor Presencia #' || i
            END,
            mac,
            '192.168.' || FLOOR(RANDOM() * 5 + 1)::INT || '.' || (10 + i),
            CASE FLOOR(RANDOM() * 10)::INT
                WHEN 0 THEN 'Inactive'::device_status_enum
                WHEN 1 THEN 'Maintenance'::device_status_enum
                ELSE        'Active'::device_status_enum
            END,
            NOW() - (FLOOR(RANDOM() * 48) || ' hours')::INTERVAL,
            CASE WHEN RANDOM() > 0.8 THEN 'Requiere revisión técnica' ELSE NULL END
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== ATTENDANCE ====================
-- ~3000 registros asociando al dispositivo del salón del horario

CREATE OR REPLACE PROCEDURE insert_attendance()
LANGUAGE plpgsql AS $$
DECLARE
    studentId  INT;
    scheduleId INT;
    deviceId   INT;
    statuses   attendance_status_enum[] :=
        ARRAY['Present','Present','Present','Absent','Late']::attendance_status_enum[];
    slotIdx    INT;
    horas      TIME[] := ARRAY['06:05','08:03','10:01','12:02','14:33']::TIME[];
BEGIN
    FOR i IN 1..3000 LOOP
        SELECT id_person INTO studentId
        FROM person WHERE is_student = TRUE
        ORDER BY RANDOM() LIMIT 1;

        SELECT id_schedule INTO scheduleId
        FROM schedule ORDER BY RANDOM() LIMIT 1;

        -- Buscar dispositivo activo en el salón del horario
        SELECT d.id_device INTO deviceId
        FROM iot_device d
        JOIN schedule   sc ON sc.id_schedule  = scheduleId
        WHERE d.id_classroom = sc.id_classroom
          AND d.status = 'Active'
        ORDER BY RANDOM() LIMIT 1;

        -- Si el salón no tiene dispositivo activo, tomar cualquier dispositivo activo
        IF deviceId IS NULL THEN
            SELECT id_device INTO deviceId
            FROM iot_device WHERE status = 'Active'
            ORDER BY RANDOM() LIMIT 1;
        END IF;

        CONTINUE WHEN studentId IS NULL OR scheduleId IS NULL OR deviceId IS NULL;

        slotIdx := FLOOR(RANDOM() * 5 + 1)::INT;

        INSERT INTO attendance (id_attendance, id_student, id_schedule, id_device,
                                date, time, status)
        VALUES (
            i,
            studentId,
            scheduleId,
            deviceId,
            CURRENT_DATE - (FLOOR(RANDOM() * 120) || ' days')::INTERVAL,
            horas[slotIdx],
            statuses[FLOOR(RANDOM() * 5 + 1)::INT]
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== JUSTIFICATION ====================
-- ~500 justificaciones para ausencias y tardanzas, con estado correcto

CREATE OR REPLACE PROCEDURE insert_justification()
LANGUAGE plpgsql AS $$
DECLARE
    attId        INT;
    reviewerId   INT;
    razones      TEXT[] := ARRAY[
        'Cita médica urgente',      'Incapacidad médica certificada',
        'Calamidad doméstica',      'Diligencia personal impostergable',
        'Evento académico externo', 'Problema de transporte',
        'Enfermedad familiar',      'Trámite administrativo'
    ];
    statuses     approval_status_enum[] :=
        ARRAY['Pending','Approved','Approved','Approved','Rejected']::approval_status_enum[];
    chosenStatus approval_status_enum;
    createdAt    TIMESTAMP;
BEGIN
    FOR i IN 1..500 LOOP
        -- Ausencias o tardanzas sin justificación previa
        SELECT id_attendance INTO attId
        FROM attendance
        WHERE status IN ('Absent', 'Late')
          AND id_attendance NOT IN (SELECT id_attendance FROM justification)
        ORDER BY RANDOM()
        LIMIT 1;

        CONTINUE WHEN attId IS NULL;

        chosenStatus := statuses[FLOOR(RANDOM() * 5 + 1)::INT];
        createdAt    := NOW() - (FLOOR(RANDOM() * 60) || ' days')::INTERVAL;

        -- Revisor: cualquier usuario con rol Administrador o Supervisor
        IF chosenStatus != 'Pending' THEN
            SELECT ur.id_user INTO reviewerId
            FROM user_role ur
            WHERE ur.id_role IN (1, 4)
            ORDER BY RANDOM() LIMIT 1;
        ELSE
            reviewerId := NULL;
        END IF;

        INSERT INTO justification (id_justification, id_attendance, justification,
                                   approval, created_at, reviewed_by, reviewed_at)
        VALUES (
            i,
            attId,
            razones[FLOOR(RANDOM() * array_length(razones, 1) + 1)::INT],
            chosenStatus,
            createdAt,
            reviewerId,
            CASE WHEN reviewerId IS NOT NULL
                 THEN createdAt + (FLOOR(RANDOM() * 5 + 1) || ' days')::INTERVAL
                 ELSE NULL
            END
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;


-- ==================== FACIAL_EMBEDDING ====================
-- 1 embedding activo por persona (vector simulado de 512 dimensiones)

CREATE OR REPLACE PROCEDURE insert_facial_embedding()
LANGUAGE plpgsql AS $$
DECLARE
    p       RECORD;
    emb_arr REAL[]; -- Cambiado a REAL[]
BEGIN
    FOR p IN SELECT id_person FROM person WHERE status = TRUE ORDER BY id_person LOOP
        -- Vector aleatorio de 512 dimensiones (simula salida de FaceNet)
        emb_arr := ARRAY(
            SELECT ROUND((RANDOM() * 2 - 1)::NUMERIC, 6)::REAL
            FROM generate_series(1, 512)
        );

        INSERT INTO facial_embedding (id_person, embedding, model_version,
                                      is_active, created_at)
        VALUES (
            p.id_person,
            emb_arr, -- Insertamos el array directamente
            'FaceNet-v1.0',
            TRUE,
            NOW() - (FLOOR(RANDOM() * 90) || ' days')::INTERVAL
        )
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;