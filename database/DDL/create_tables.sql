CREATE
OR REPLACE PROCEDURE create_tables () LANGUAGE plpgsql AS $$
BEGIN
    CREATE TABLE
        "Person" (
            "id_person" int UNIQUE PRIMARY KEY,
            "name" varchar,
            "last_name" varchar,
            "email" varchar UNIQUE,
            "phone" varchar,
            "status" bool
        );

    CREATE TABLE
        "Role" (
            "id_role" int UNIQUE PRIMARY KEY,
            "name" varchar UNIQUE,
            "description" varchar
        );

    CREATE TABLE
        "User" (
            "id_user" int UNIQUE PRIMARY KEY,
            "id_person" int UNIQUE,
            "id_language" int UNIQUE,
            "username" varchar UNIQUE,
            "password" varchar,
            "status_alerts" boolean,
            "is_student" boolean,
            "status" boolean,
            "created_at" datetime,
            "last_login" datetime,
            FOREIGN KEY (id_person) REFERENCES Person (id_person),
            FOREIGN KEY (id_language) REFERENCES Language (id_language)
        );

    CREATE TABLE
        "Module" (
            "id_module" int UNIQUE PRIMARY KEY,
            "name" varchar,
            "description" varchar,
            "icon" varchar,
            "order" int
        );

    CREATE TABLE
        "View" (
            "id_view" int UNIQUE PRIMARY KEY,
            "name" varchar,
            "route" varchar,
            "title" varchar,
            "is_public" bool
        );

    CREATE TABLE
        "Action" (
            "id_action" int UNIQUE PRIMARY KEY,
            "name" varchar,
            "description" varchar,
            "http_method" varchar,
            "enabled" bool
        );

    CREATE TABLE
        "User_Role" (
            "id_user" int,
            "id_role" int,
            "assigned_date" datetime,
            FOREIGN KEY (id_user) REFERENCES User(id_user),
            FOREIGN KEY (id_role) REFERENCES Role (id_role)
        );

    CREATE TABLE
        "Role_Module" (
            "id_role" int,
            "id_module" int,
            FOREIGN KEY (id_role) REFERENCES Role (id_role),
            FOREIGN KEY (id_module) REFERENCES Module (id_module)
        );

    CREATE TABLE
        "View_Module" (
            "id_view" int,
            "id_module" int,
            FOREIGN KEY (id_view) REFERENCES View (id_view),
            FOREIGN KEY (id_module) REFERENCES Module (id_module)
        );

    CREATE TABLE
        "View_Action" (
            "id_view" int,
            "id_action" int,
            FOREIGN KEY (id_view) REFERENCES View (id_view),
            FOREIGN KEY (id_action) REFERENCES Action (id_action)
        );

    CREATE TABLE
        "Student" (
            "id_student" int UNIQUE PRIMARY KEY,
            "id_person" int,
            FOREIGN KEY (id_person) REFERENCES Person (id_person)
        );

    CREATE TABLE
        "Teacher" (
            "id_teacher" int UNIQUE PRIMARY KEY,
            "id_person" int,
            FOREIGN KEY (id_person) REFERENCES Person (id_person)
        );

    CREATE TABLE
        "Course" (
            "id_course" int UNIQUE PRIMARY KEY,
            "course_name" varchar,
            "course_code" varchar
        );

    CREATE TABLE
        "Classroom" (
            "id_classroom" int UNIQUE PRIMARY KEY,
            "classroom_name" varchar
        );

    CREATE TABLE
        "Schedule" (
            "id_schedule" int UNIQUE PRIMARY KEY,
            "id_course" int,
            "id_teacher" int,
            "id_classroom" int,
            "day" varchar,
            "start_time" time,
            "end_time" time,
            FOREIGN KEY (id_course) REFERENCES Course (id_course),
            FOREIGN KEY (id_teacher) REFERENCES Teacher (id_teacher),
            FOREIGN KEY (id_classroom) REFERENCES Classroom (id_classroom)
        );

    CREATE TABLE
        "Enrollment" (
            "id_enrollment" int UNIQUE PRIMARY KEY,
            "id_student" int,
            "id_course" int,
            "enrollment_date" datetime,
            "status" varchar,
            FOREIGN KEY (id_student) REFERENCES Student (id_student),
            FOREIGN KEY (id_course) REFERENCES Course (id_course)
        );

    CREATE TABLE
        "Attendance" (
            "id_attendance" int UNIQUE PRIMARY KEY,
            "id_student" int,
            "id_schedule" int,
            "date" date,
            "time" time,
            "status" varchar,
            FOREIGN KEY (id_student) REFERENCES Student (id_student),
            FOREIGN KEY (id_schedule) REFERENCES Schedule (id_schedule)
        );

    CREATE TABLE
        "Justification" (
            "id_justification" int UNIQUE PRIMARY KEY,
            "id_attendance" int,
            "justification" text,
            "approval" boolean,
            FOREIGN KEY (id_attendance) REFERENCES Attendance (id_attendance)
        );

    CREATE TABLE
        "Language" (
            "id_language" int UNIQUE PRIMARY KEY,
            "language_name" varchar
        );

    CREATE TABLE
        "Person_Parameters" (
            "id_parameters" int UNIQUE PRIMARY KEY,
            "id_person" int,
            "traits" text,
            FOREIGN KEY (id_person) REFERENCES Person (id_person)
        );

    CREATE TABLE
        "IoT_Device" (
            "id_device" int UNIQUE PRIMARY KEY,
            "device_name" varchar,
            "location" int,
            "status" varchar,
            "observation" text,
            FOREIGN KEY (location) REFERENCES Classroom (id_classroom)
        );

    CREATE TABLE
        "Log" (
            "id_log" int UNIQUE PRIMARY KEY,
            "action" varchar,
            "table_name" varchar,
            "affected_record" int,
            "description" text,
            "date" datetime
        );
    
END;
$$;