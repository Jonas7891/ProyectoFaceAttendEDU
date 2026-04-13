CREATE OR REPLACE PROCEDURE delete_tables()
LANGUAGE plpgsql
AS $$
BEGIN

    -- AUDIT
    DROP TABLE IF EXISTS log CASCADE;

    -- CONFIGURATION
    DROP TABLE IF EXISTS facial_embedding CASCADE;

    -- ATTENDANCE
    DROP TABLE IF EXISTS justification CASCADE;
    DROP TABLE IF EXISTS attendance CASCADE;

    -- IOT DEVICES
    DROP TABLE IF EXISTS iot_device CASCADE;

    -- ACADEMIC
    DROP TABLE IF EXISTS enrollment CASCADE;
    DROP TABLE IF EXISTS schedule CASCADE;
    DROP TABLE IF EXISTS period CASCADE;
    DROP TABLE IF EXISTS classroom CASCADE;
    DROP TABLE IF EXISTS course CASCADE;

    -- SECURITY
    DROP TABLE IF EXISTS view_action CASCADE;
    DROP TABLE IF EXISTS view_module CASCADE;
    DROP TABLE IF EXISTS role_module CASCADE;
    DROP TABLE IF EXISTS user_role CASCADE;
    DROP TABLE IF EXISTS action CASCADE;
    DROP TABLE IF EXISTS view CASCADE;
    DROP TABLE IF EXISTS module CASCADE;
    DROP TABLE IF EXISTS "user" CASCADE;
    DROP TABLE IF EXISTS language CASCADE;
    DROP TABLE IF EXISTS role CASCADE;
    DROP TABLE IF EXISTS person CASCADE;
    DROP TABLE IF EXISTS school CASCADE;

    -- =============================================================
    --  ENUMS  (eliminar después de las tablas que los usan)
    -- =============================================================

    DROP TYPE IF EXISTS device_status_enum;
    DROP TYPE IF EXISTS approval_status_enum;
    DROP TYPE IF EXISTS attendance_status_enum;
    DROP TYPE IF EXISTS enrollment_status_enum;
    DROP TYPE IF EXISTS days_enum;

END;
$$;