package com.faceattend_edu.shared.auth;

/**
 * Role names as authorization stores them (seed SUPER_ADMIN, SCHOOL_ADMIN, INSTRUCTOR,
 * STUDENT). The session check hands them to the services in {@code Caller.roles()}.
 */
public final class Roles {

    public static final String SUPER_ADMIN = "Super Administrador";
    public static final String SCHOOL_ADMIN = "Administrador";
    public static final String INSTRUCTOR = "Instructor";
    public static final String STUDENT = "Aprendiz";

    private Roles() {
    }
}
