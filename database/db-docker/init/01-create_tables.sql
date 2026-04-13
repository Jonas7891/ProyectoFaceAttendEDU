CREATE
OR REPLACE PROCEDURE create_tables() LANGUAGE plpgsql AS $$
BEGIN
    
    -- =============================================================
    --  ENUMS
    -- =============================================================

    CREATE TYPE days_enum AS ENUM (
        'Lunes', 'Martes', 'Miercoles', 'Jueves',
        'Viernes', 'Sabado', 'Domingo'
    );

    CREATE TYPE enrollment_status_enum AS ENUM (
        'Active', 'Withdrawn', 'Completed'
    );

    CREATE TYPE attendance_status_enum AS ENUM (
        'Present', 'Absent', 'Late', 'Justified'
    );

    CREATE TYPE approval_status_enum AS ENUM (
        'Pending', 'Approved', 'Rejected'
    );

    CREATE TYPE device_status_enum AS ENUM (
        'Active', 'Inactive', 'Maintenance'
    );


    -- =============================================================
    --  SECURITY
    -- =============================================================

    CREATE TABLE school (
        id_school  SERIAL       PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        nit        VARCHAR(50)  NOT NULL UNIQUE,
        address    VARCHAR(500) NULL,
        phone      VARCHAR(20)  NULL,
        email      VARCHAR(255) NULL,
        status     BOOLEAN      NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP    NULL
    );

    CREATE TABLE person (
        id_person  SERIAL       PRIMARY KEY,
        id_school  INTEGER      NOT NULL,
        name       VARCHAR(255) NOT NULL,
        last_name  VARCHAR(255) NOT NULL,
        email      VARCHAR(255) NULL,
        phone      VARCHAR(20)  NULL,
        is_student BOOLEAN      NOT NULL DEFAULT FALSE,
        is_teacher BOOLEAN      NOT NULL DEFAULT FALSE,
        status     BOOLEAN      NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP    NULL,
        CONSTRAINT fk_person_school FOREIGN KEY (id_school) REFERENCES school (id_school),
        CONSTRAINT uq_person_email_school UNIQUE (email, id_school)
    );

    CREATE TABLE role (
        id_role     SERIAL       PRIMARY KEY,
        name        VARCHAR(100) NOT NULL UNIQUE,
        description TEXT         NULL
    );

    CREATE TABLE language (
        id_language   SERIAL       PRIMARY KEY,
        language_name VARCHAR(100) NOT NULL
    );

    CREATE TABLE "user" (
        id_user     SERIAL       PRIMARY KEY,
        id_person   INTEGER      NOT NULL UNIQUE,
        id_language INTEGER      NULL,
        username    VARCHAR(100) NOT NULL UNIQUE,
        password    VARCHAR(255) NOT NULL,
        status      BOOLEAN      NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMP    NULL,
        last_login  TIMESTAMP    NULL,
        CONSTRAINT fk_user_person   FOREIGN KEY (id_person)   REFERENCES person (id_person),
        CONSTRAINT fk_user_language FOREIGN KEY (id_language) REFERENCES language (id_language)
    );

    CREATE TABLE module (
        id_module   SERIAL       PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        description TEXT         NULL,
        icon        VARCHAR(100) NULL,
        "order"     INTEGER      NOT NULL
    );

    CREATE TABLE view (
        id_view   SERIAL       PRIMARY KEY,
        name      VARCHAR(255) NOT NULL,
        route     VARCHAR(500) NOT NULL,
        title     VARCHAR(255) NOT NULL,
        is_public BOOLEAN      NOT NULL DEFAULT FALSE
    );

    CREATE TABLE action (
        id_action   SERIAL      PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        description TEXT         NULL,
        http_method VARCHAR(10)  NOT NULL,
        enabled     BOOLEAN      NOT NULL DEFAULT TRUE
    );

    CREATE TABLE user_role (
        id_user       INTEGER   NOT NULL,
        id_role       INTEGER   NOT NULL,
        assigned_date TIMESTAMP NOT NULL DEFAULT NOW(),
        expiry_date   TIMESTAMP NULL,  -- NULL = rol vigente
        CONSTRAINT pk_user_role      PRIMARY KEY (id_user, id_role),
        CONSTRAINT fk_user_role_user FOREIGN KEY (id_user) REFERENCES "user" (id_user),
        CONSTRAINT fk_user_role_role FOREIGN KEY (id_role) REFERENCES role (id_role)
    );

    CREATE TABLE role_module (
        id_role   INTEGER NOT NULL,
        id_module INTEGER NOT NULL,
        CONSTRAINT pk_role_module        PRIMARY KEY (id_role, id_module),
        CONSTRAINT fk_role_module_role   FOREIGN KEY (id_role)   REFERENCES role (id_role),
        CONSTRAINT fk_role_module_module FOREIGN KEY (id_module) REFERENCES module (id_module)
    );

    CREATE TABLE view_module (
        id_view   INTEGER NOT NULL,
        id_module INTEGER NOT NULL,
        CONSTRAINT pk_view_module        PRIMARY KEY (id_view, id_module),
        CONSTRAINT fk_view_module_view   FOREIGN KEY (id_view)   REFERENCES view (id_view),
        CONSTRAINT fk_view_module_module FOREIGN KEY (id_module) REFERENCES module (id_module)
    );

    CREATE TABLE view_action (
        id_view   INTEGER NOT NULL,
        id_action INTEGER NOT NULL,
        CONSTRAINT pk_view_action        PRIMARY KEY (id_view, id_action),
        CONSTRAINT fk_view_action_view   FOREIGN KEY (id_view)   REFERENCES view (id_view),
        CONSTRAINT fk_view_action_action FOREIGN KEY (id_action) REFERENCES action (id_action)
    );


    -- =============================================================
    --  ACADEMIC
    -- =============================================================

    CREATE TABLE course (
        id_course   SERIAL       PRIMARY KEY,
        id_school   INTEGER      NOT NULL,
        course_name VARCHAR(255) NOT NULL,
        course_code VARCHAR(50)  NOT NULL,
        CONSTRAINT fk_course_school      FOREIGN KEY (id_school) REFERENCES school (id_school),
        CONSTRAINT uq_course_code_school UNIQUE (course_code, id_school)
    );

    CREATE TABLE classroom (
        id_classroom   SERIAL       PRIMARY KEY,
        id_school      INTEGER      NOT NULL,
        classroom_name VARCHAR(255) NOT NULL,
        CONSTRAINT fk_classroom_school FOREIGN KEY (id_school) REFERENCES school (id_school)
    );

    CREATE TABLE period (
        id_period  SERIAL      PRIMARY KEY,
        id_school  INTEGER     NOT NULL,
        name       VARCHAR(50) NOT NULL,
        start_date DATE        NOT NULL,
        end_date   DATE        NOT NULL,
        is_active  BOOLEAN     NOT NULL DEFAULT FALSE,
        CONSTRAINT fk_period_school      FOREIGN KEY (id_school) REFERENCES school (id_school),
        CONSTRAINT uq_period_name_school UNIQUE (id_school, name),
        CONSTRAINT chk_period_dates      CHECK (end_date > start_date)
    );

    CREATE TABLE schedule (
        id_schedule  SERIAL      PRIMARY KEY,
        id_period    INTEGER     NOT NULL,
        id_course    INTEGER     NOT NULL,
        id_teacher   INTEGER     NOT NULL,
        id_classroom INTEGER     NOT NULL,
        day          days_enum   NOT NULL,
        start_time   TIME        NOT NULL,
        end_time     TIME        NOT NULL,
        CONSTRAINT fk_schedule_period    FOREIGN KEY (id_period)    REFERENCES period (id_period),
        CONSTRAINT fk_schedule_course    FOREIGN KEY (id_course)    REFERENCES course (id_course),
        CONSTRAINT fk_schedule_teacher   FOREIGN KEY (id_teacher)   REFERENCES person (id_person),
        CONSTRAINT fk_schedule_classroom FOREIGN KEY (id_classroom) REFERENCES classroom (id_classroom),
        CONSTRAINT chk_schedule_times    CHECK (end_time > start_time),
        -- Evita que el mismo salón tenga dos clases al mismo tiempo en el mismo periodo
        CONSTRAINT uq_schedule_classroom_slot UNIQUE (id_classroom, day, start_time, id_period),
        -- Evita que el mismo docente tenga dos clases al mismo tiempo en el mismo periodo
        CONSTRAINT uq_schedule_teacher_slot   UNIQUE (id_teacher, day, start_time, id_period)
    );

    CREATE TABLE enrollment (
        id_enrollment   SERIAL                 PRIMARY KEY,
        id_student      INTEGER                NOT NULL,
        id_course       INTEGER                NOT NULL,
        id_period       INTEGER                NOT NULL,
        enrollment_date TIMESTAMP              NOT NULL DEFAULT NOW(),
        status          enrollment_status_enum NOT NULL DEFAULT 'Active',
        CONSTRAINT fk_enrollment_student FOREIGN KEY (id_student) REFERENCES person (id_person),
        CONSTRAINT fk_enrollment_course  FOREIGN KEY (id_course)  REFERENCES course (id_course),
        CONSTRAINT fk_enrollment_period  FOREIGN KEY (id_period)  REFERENCES period (id_period),
        -- Un estudiante no puede matricularse dos veces en el mismo curso en el mismo periodo
        CONSTRAINT uq_enrollment_student_course_period UNIQUE (id_student, id_course, id_period)
    );


    -- =============================================================
    --  IOT DEVICES  (antes de ATTENDANCE por FK)
    -- =============================================================

    CREATE TABLE iot_device (
        id_device       SERIAL             PRIMARY KEY,
        id_classroom    INTEGER            NOT NULL,
        device_name     VARCHAR(255)       NOT NULL,
        mac_address     VARCHAR(17)        NULL UNIQUE,  -- formato XX:XX:XX:XX:XX:XX
        ip_address      VARCHAR(45)        NULL,         -- soporta IPv4 e IPv6
        status          device_status_enum NOT NULL DEFAULT 'Active',
        last_connection TIMESTAMP          NULL,
        observation     TEXT               NULL,
        CONSTRAINT fk_device_classroom FOREIGN KEY (id_classroom) REFERENCES classroom (id_classroom)
    );


    -- =============================================================
    --  ATTENDANCE
    -- =============================================================

    CREATE TABLE attendance (
        id_attendance SERIAL                  PRIMARY KEY,
        id_student    INTEGER                 NOT NULL,
        id_schedule   INTEGER                 NOT NULL,
        id_device     INTEGER                 NOT NULL,
        date          DATE                    NOT NULL,
        time          TIME                    NOT NULL,
        status        attendance_status_enum  NOT NULL,
        CONSTRAINT fk_attendance_student  FOREIGN KEY (id_student)  REFERENCES person (id_person),
        CONSTRAINT fk_attendance_schedule FOREIGN KEY (id_schedule) REFERENCES schedule (id_schedule),
        CONSTRAINT fk_attendance_device   FOREIGN KEY (id_device)   REFERENCES iot_device (id_device),
        CONSTRAINT uq_attendance_student_schedule_date UNIQUE (id_student, id_schedule, date)
    );

    CREATE INDEX idx_attendance_schedule ON attendance (id_schedule);
    CREATE INDEX idx_attendance_date     ON attendance (date);

    CREATE TABLE justification (
        id_justification SERIAL               PRIMARY KEY,
        id_attendance    INTEGER              NOT NULL UNIQUE,  -- una sola justificación por registro
        justification    TEXT                 NOT NULL,
        approval         approval_status_enum NOT NULL DEFAULT 'Pending',
        created_at       TIMESTAMP            NOT NULL DEFAULT NOW(),
        reviewed_by      INTEGER              NULL,  -- NULL hasta ser revisada
        reviewed_at      TIMESTAMP            NULL,  -- NULL hasta ser revisada
        CONSTRAINT fk_justification_attendance  FOREIGN KEY (id_attendance) REFERENCES attendance (id_attendance),
        CONSTRAINT fk_justification_reviewed_by FOREIGN KEY (reviewed_by)   REFERENCES "user" (id_user),
        -- Garantiza que reviewed_by y reviewed_at se llenen juntos o no se llenen
        CONSTRAINT chk_justification_review CHECK (
            (reviewed_by IS NULL AND reviewed_at IS NULL) OR
            (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
        )
    );


    -- =============================================================
    --  CONFIGURATION
    -- =============================================================

    CREATE TABLE facial_embedding (
        id_embedding  SERIAL      PRIMARY KEY,
        id_person     INTEGER     NOT NULL,
        embedding     REAL[] NOT NULL,  -- dimensión según el modelo facial usado
        model_version VARCHAR(50) NOT NULL,
        is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
        created_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_embedding_person FOREIGN KEY (id_person) REFERENCES person (id_person)
    );

    CREATE INDEX idx_embedding_person_active ON facial_embedding (id_person, is_active);


    -- =============================================================
    --  AUDIT
    -- =============================================================

    CREATE TABLE log (
        id_log          SERIAL       PRIMARY KEY,
        id_user         INTEGER      NULL,           -- NULL para acciones del sistema
        action          VARCHAR(100) NOT NULL,
        table_name      VARCHAR(100) NOT NULL,
        affected_record VARCHAR(100) NULL,           -- VARCHAR para soportar cualquier tipo de PK
        description     TEXT         NULL,
        date            TIMESTAMP    NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_log_user FOREIGN KEY (id_user) REFERENCES "user" (id_user)
    );

    CREATE INDEX idx_log_table_record ON log (table_name, affected_record);
    CREATE INDEX idx_log_date         ON log (date);
    CREATE INDEX idx_log_user         ON log (id_user);
    
END;
$$;

