-- =============================================================
--  TRIGGERS — PostgreSQL 18
--  Sistema de registro de asistencia mediante escaneo facial
--
--  Contenido:
--    1. Extensión hstore
--    2. fn_log_generic         → auditoría automática en Log
--    3. fn_set_updated_at      → auto-actualiza updated_at
--    4. fn_sync_attendance     → sincroniza status al aprobar justificación
--    5. fn_deactivate_embeddings → desactiva embeddings anteriores al insertar uno nuevo
--    6. Triggers de auditoría  (INSERT / UPDATE / DELETE por tabla)
--    7. Triggers de updated_at
--    8. Triggers de lógica de negocio
-- =============================================================


-- =============================================================
--  EXTENSIONES
-- =============================================================

CREATE EXTENSION IF NOT EXISTS hstore;


-- =============================================================
--  1. FUNCIÓN GENÉRICA DE AUDITORÍA
-- =============================================================
--
--  Registra automáticamente INSERT, UPDATE y DELETE en la tabla Log.
--
--  Cómo obtener el usuario de sesión desde la aplicación:
--    SET LOCAL app.current_user_id = '42';
--  Si no se configura, id_user queda NULL (acción del sistema).
--
--  Convención de PKs:
--    id_<tabla>  →  regla general
--    Excepciones:  iot_device → id_device
--                  facial_embedding → id_embedding

CREATE OR REPLACE FUNCTION fn_log_generic()
RETURNS TRIGGER AS $$
DECLARE
    v_pk_field    VARCHAR(64);
    v_record      hstore;
    v_affected_id VARCHAR(100);
    v_description TEXT;
    v_session_uid INT;
BEGIN
    -- Resolver campo PK según convención (con excepciones)
    v_pk_field := CASE TG_TABLE_NAME
        WHEN 'iot_device'       THEN 'id_device'
        WHEN 'facial_embedding' THEN 'id_embedding'
        ELSE 'id_' || TG_TABLE_NAME
    END;

    -- Serializar registro afectado
    IF TG_OP = 'DELETE' THEN
        v_record := hstore(OLD);
    ELSE
        v_record := hstore(NEW);
    END IF;

    v_affected_id := v_record -> v_pk_field;

    v_description := CASE TG_OP
        WHEN 'INSERT' THEN 'Registro insertado en '   || TG_TABLE_NAME || ' — ID: ' || COALESCE(v_affected_id, '?')
        WHEN 'UPDATE' THEN 'Registro actualizado en '  || TG_TABLE_NAME || ' — ID: ' || COALESCE(v_affected_id, '?')
        WHEN 'DELETE' THEN 'Registro eliminado de '   || TG_TABLE_NAME || ' — ID: ' || COALESCE(v_affected_id, '?')
    END;

    -- Leer usuario de sesión inyectado por la capa de aplicación
    BEGIN
        v_session_uid := current_setting('app.current_user_id', TRUE)::INT;
    EXCEPTION WHEN OTHERS THEN
        v_session_uid := NULL;
    END;

    -- id_log es SERIAL: no se especifica para que PostgreSQL lo gestione
    INSERT INTO log (id_user, action, table_name, affected_record, description, date)
    VALUES (
        v_session_uid,
        TG_OP,
        TG_TABLE_NAME,
        v_affected_id,
        v_description,
        NOW()
    );

    RETURN NULL;  -- AFTER trigger: valor de retorno ignorado
END;
$$ LANGUAGE plpgsql;


-- =============================================================
--  2. FUNCIÓN updated_at
-- =============================================================
--  Actualiza automáticamente el campo updated_at antes de cada UPDATE.
--  Usar solo en tablas que tengan esa columna: school, person, user.

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================
--  3. FUNCIÓN: sincronizar Attendance al aprobar Justification
-- =============================================================
--  Cuando una justificación pasa a 'Approved', el registro de
--  asistencia asociado cambia automáticamente a 'Justified'.
--  Cuando se rechaza o revoca, revierte el estado anterior
--  (Absent o Late) según la hora registrada.

CREATE OR REPLACE FUNCTION fn_sync_attendance_on_justification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.approval = 'Approved' AND
       (OLD IS NULL OR OLD.approval IS DISTINCT FROM 'Approved') THEN

        UPDATE attendance
        SET status = 'Justified'
        WHERE id_attendance = NEW.id_attendance;

    ELSIF NEW.approval = 'Rejected' AND
          OLD.approval = 'Approved' THEN

        -- Revertir a 'Late' si llegó tarde, o a 'Absent' si no llegó
        UPDATE attendance
        SET status = CASE
            WHEN EXTRACT(MINUTE FROM time) > 5 THEN 'Late'::attendance_status_enum
            ELSE 'Absent'::attendance_status_enum
        END
        WHERE id_attendance = NEW.id_attendance;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================
--  4. FUNCIÓN: desactivar embeddings anteriores
-- =============================================================
--  Cuando se inserta un nuevo embedding activo para una persona,
--  desactiva automáticamente los embeddings previos.
--  Garantiza que cada persona tenga exactamente un embedding activo.

CREATE OR REPLACE FUNCTION fn_deactivate_old_embeddings()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = TRUE THEN
        UPDATE facial_embedding
        SET is_active = FALSE
        WHERE id_person    = NEW.id_person
          AND id_embedding != NEW.id_embedding
          AND is_active    = TRUE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================
--  TRIGGERS DE AUDITORÍA
--  INSERT | UPDATE | DELETE → fn_log_generic
-- =============================================================

-- ── SCHOOL ──────────────────────────────────────────────────
CREATE TRIGGER trg_school_insert
AFTER INSERT ON school FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_school_update
AFTER UPDATE  ON school FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_school_delete
AFTER DELETE  ON school FOR EACH ROW EXECUTE FUNCTION fn_log_generic();


-- ── PERSON ──────────────────────────────────────────────────
CREATE TRIGGER trg_person_insert
AFTER INSERT ON person FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_person_update
AFTER UPDATE  ON person FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_person_delete
AFTER DELETE  ON person FOR EACH ROW EXECUTE FUNCTION fn_log_generic();


-- ── USER ────────────────────────────────────────────────────
CREATE TRIGGER trg_user_insert
AFTER INSERT ON "user" FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_user_update
AFTER UPDATE  ON "user" FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_user_delete
AFTER DELETE  ON "user" FOR EACH ROW EXECUTE FUNCTION fn_log_generic();


-- ── ROLE ────────────────────────────────────────────────────
CREATE TRIGGER trg_role_insert
AFTER INSERT ON role FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_role_update
AFTER UPDATE  ON role FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_role_delete
AFTER DELETE  ON role FOR EACH ROW EXECUTE FUNCTION fn_log_generic();


-- ── COURSE ──────────────────────────────────────────────────
CREATE TRIGGER trg_course_insert
AFTER INSERT ON course FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_course_update
AFTER UPDATE  ON course FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_course_delete
AFTER DELETE  ON course FOR EACH ROW EXECUTE FUNCTION fn_log_generic();


-- ── CLASSROOM ───────────────────────────────────────────────
CREATE TRIGGER trg_classroom_insert
AFTER INSERT ON classroom FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_classroom_update
AFTER UPDATE  ON classroom FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_classroom_delete
AFTER DELETE  ON classroom FOR EACH ROW EXECUTE FUNCTION fn_log_generic();


-- ── PERIOD ──────────────────────────────────────────────────
CREATE TRIGGER trg_period_insert
AFTER INSERT ON period FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_period_update
AFTER UPDATE  ON period FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_period_delete
AFTER DELETE  ON period FOR EACH ROW EXECUTE FUNCTION fn_log_generic();


-- ── SCHEDULE ────────────────────────────────────────────────
CREATE TRIGGER trg_schedule_insert
AFTER INSERT ON schedule FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_schedule_update
AFTER UPDATE  ON schedule FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_schedule_delete
AFTER DELETE  ON schedule FOR EACH ROW EXECUTE FUNCTION fn_log_generic();


-- ── ENROLLMENT ──────────────────────────────────────────────
CREATE TRIGGER trg_enrollment_insert
AFTER INSERT ON enrollment FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_enrollment_update
AFTER UPDATE  ON enrollment FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_enrollment_delete
AFTER DELETE  ON enrollment FOR EACH ROW EXECUTE FUNCTION fn_log_generic();


-- ── IOT_DEVICE ──────────────────────────────────────────────
CREATE TRIGGER trg_iot_device_insert
AFTER INSERT ON iot_device FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_iot_device_update
AFTER UPDATE  ON iot_device FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_iot_device_delete
AFTER DELETE  ON iot_device FOR EACH ROW EXECUTE FUNCTION fn_log_generic();


-- ── ATTENDANCE ──────────────────────────────────────────────
CREATE TRIGGER trg_attendance_insert
AFTER INSERT ON attendance FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_attendance_update
AFTER UPDATE  ON attendance FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_attendance_delete
AFTER DELETE  ON attendance FOR EACH ROW EXECUTE FUNCTION fn_log_generic();


-- ── JUSTIFICATION ───────────────────────────────────────────
CREATE TRIGGER trg_justification_insert
AFTER INSERT ON justification FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_justification_update
AFTER UPDATE  ON justification FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_justification_delete
AFTER DELETE  ON justification FOR EACH ROW EXECUTE FUNCTION fn_log_generic();


-- ── FACIAL_EMBEDDING ────────────────────────────────────────
CREATE TRIGGER trg_facial_embedding_insert
AFTER INSERT ON facial_embedding FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_facial_embedding_update
AFTER UPDATE  ON facial_embedding FOR EACH ROW EXECUTE FUNCTION fn_log_generic();

CREATE TRIGGER trg_facial_embedding_delete
AFTER DELETE  ON facial_embedding FOR EACH ROW EXECUTE FUNCTION fn_log_generic();


-- =============================================================
--  TRIGGERS updated_at
--  BEFORE UPDATE para reflejar el cambio en la misma transacción
-- =============================================================

CREATE TRIGGER trg_school_updated_at
BEFORE UPDATE ON school FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_person_updated_at
BEFORE UPDATE ON person FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_user_updated_at
BEFORE UPDATE ON "user" FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- =============================================================
--  TRIGGERS DE LÓGICA DE NEGOCIO
-- =============================================================

-- Sincronizar estado de asistencia cuando cambia el estado de justificación
CREATE TRIGGER trg_justification_sync_attendance
AFTER INSERT OR UPDATE OF approval ON justification
FOR EACH ROW EXECUTE FUNCTION fn_sync_attendance_on_justification();

-- Desactivar embeddings anteriores cuando se registra uno nuevo activo
CREATE TRIGGER trg_facial_embedding_deactivate_old
AFTER INSERT ON facial_embedding
FOR EACH ROW EXECUTE FUNCTION fn_deactivate_old_embeddings();