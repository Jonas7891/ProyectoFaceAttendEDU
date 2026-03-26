CREATE OR REPLACE FUNCTION validarResponsable-Jornada()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    tipo INT;
BEGIN
    -- Buscar tipo de usuario del responsable
    SELECT tipoUsuario INTO tipo
    FROM Usuario
    WHERE identificacion = NEW.idResponsable;

    -- Si no existe el usuario
    IF tipo IS NULL THEN
        RAISE EXCEPTION 'El idResponsable % no existe en la tabla Usuario', NEW.idResponsable;
    END IF;

    -- Si no es profesor (tipo 3)
    IF tipo != 3 THEN
        RAISE EXCEPTION 'El idResponsable % debe ser de tipo Profesor (tipoUsuario = 3)', NEW.idResponsable;
    END IF;

    RETURN NEW;
END;
$$;
