CREATE OR REPLACE FUNCTION audit.fn_audit_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at := CURRENT_TIMESTAMP;
        NEW.row_version := COALESCE(NEW.row_version, 1);
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_at := CURRENT_TIMESTAMP;
        NEW.row_version := NEW.row_version + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
