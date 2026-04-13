-- Requiere la extensión hstore
CREATE EXTENSION IF NOT EXISTS hstore;

-- ==================== FUNCIÓN GENÉRICA DE LOG ====================
CREATE
OR REPLACE FUNCTION function_log_generic () RETURNS TRIGGER AS $$
DECLARE
    v_accion      VARCHAR(10);
    v_idAfectado  INT;
    v_descripcion VARCHAR(128);
    v_registro    hstore;
    v_pk_campo    VARCHAR(64);
BEGIN
    -- Nombre del campo PK según la tabla (convención: id_<tabla>)
    -- Manejo de excepciones a la convención de PKs
    v_pk_campo := CASE TG_TABLE_NAME
        WHEN 'IoT_Device'        THEN 'id_device'
        WHEN 'Person_Parameters' THEN 'id_parameters'
        ELSE 'id_' || TG_TABLE_NAME
    END;
    
    v_accion   := TG_OP;

    IF TG_OP = 'DELETE' THEN
        v_registro   := hstore(OLD);
        v_idAfectado  := (v_registro -> v_pk_campo)::INT;
        v_descripcion := 'Se eliminó un registro de ' || TG_TABLE_NAME || ' con ID: ' || v_idAfectado;

    ELSIF TG_OP = 'INSERT' THEN
        v_registro    := hstore(NEW);
        v_idAfectado  := (v_registro -> v_pk_campo)::INT;
        v_descripcion := 'Se insertó un nuevo registro en ' || TG_TABLE_NAME || ' con ID: ' || v_idAfectado;

    ELSIF TG_OP = 'UPDATE' THEN
        v_registro    := hstore(NEW);
        v_idAfectado  := (v_registro -> v_pk_campo)::INT;
        v_descripcion := 'Se actualizó el registro ID: ' || v_idAfectado || ' en ' || TG_TABLE_NAME;
    END IF;

    INSERT INTO "Log"(id_log, action, table_name, affected_record, description, date)
    VALUES (
        (SELECT COALESCE(MAX(id_log), 0) + 1 FROM "Log"),
        v_accion,
        TG_TABLE_NAME,
        v_idAfectado,
        v_descripcion,
        NOW()
    );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ==================== TRIGGERS ====================
-- Person
CREATE TRIGGER trg_Person_insert
AFTER INSERT ON "Person" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Person_update
AFTER
UPDATE ON "Person" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Person_delete
AFTER DELETE ON "Person" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

-- User
CREATE TRIGGER trg_User_insert
AFTER INSERT ON "User" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_User_update
AFTER
UPDATE ON "User" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_User_delete
AFTER DELETE ON "User" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

-- Role
CREATE TRIGGER trg_Role_insert
AFTER INSERT ON "Role" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Role_update
AFTER
UPDATE ON "Role" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Role_delete
AFTER DELETE ON "Role" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

-- Course
CREATE TRIGGER trg_Course_insert
AFTER INSERT ON "Course" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Course_update
AFTER
UPDATE ON "Course" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Course_delete
AFTER DELETE ON "Course" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

-- Classroom
CREATE TRIGGER trg_Classroom_insert
AFTER INSERT ON "Classroom" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Classroom_update
AFTER
UPDATE ON "Classroom" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Classroom_delete
AFTER DELETE ON "Classroom" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

-- Schedule
CREATE TRIGGER trg_Schedule_insert
AFTER INSERT ON "Schedule" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Schedule_update
AFTER
UPDATE ON "Schedule" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Schedule_delete
AFTER DELETE ON "Schedule" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

-- Enrollment
CREATE TRIGGER trg_Enrollment_insert
AFTER INSERT ON "Enrollment" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Enrollment_update
AFTER
UPDATE ON "Enrollment" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Enrollment_delete
AFTER DELETE ON "Enrollment" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

-- Attendance
CREATE TRIGGER trg_Attendance_insert
AFTER INSERT ON "Attendance" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Attendance_update
AFTER
UPDATE ON "Attendance" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Attendance_delete
AFTER DELETE ON "Attendance" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

-- Justification
CREATE TRIGGER trg_Justification_insert
AFTER INSERT ON "Justification" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Justification_update
AFTER
UPDATE ON "Justification" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_Justification_delete
AFTER DELETE ON "Justification" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

-- IoT_Device
CREATE TRIGGER trg_IoTDevice_insert
AFTER INSERT ON "IoT_Device" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_IoTDevice_update
AFTER
UPDATE ON "IoT_Device" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_IoTDevice_delete
AFTER DELETE ON "IoT_Device" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

-- Person_Parameters
CREATE TRIGGER trg_PersonParameters_insert
AFTER INSERT ON "Person_Parameters" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_PersonParameters_update
AFTER
UPDATE ON "Person_Parameters" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();

CREATE TRIGGER trg_PersonParameters_delete
AFTER DELETE ON "Person_Parameters" FOR EACH ROW
EXECUTE FUNCTION function_log_generic ();