-- CREAR TABLAS
CALL create_tables();

-- ELIMINAR TABLAS
CALL delete_tables();

-- INSERTAR DATOS A LAS TABLAS
CALL insert_info();

-- LLAMAR LAS VISTAS
SELECT * FROM view_person;
SELECT * FROM view_role;
SELECT * FROM view_language;
SELECT * FROM view_module;
SELECT * FROM view_view;
SELECT * FROM view_action;
SELECT * FROM view_course;
SELECT * FROM view_classroom;
SELECT * FROM view_iot_device;
SELECT * FROM view_person_parameters;
SELECT * FROM view_user;
SELECT * FROM view_schedule;
SELECT * FROM view_enrollment;
SELECT * FROM view_attendance;
SELECT * FROM view_justification;