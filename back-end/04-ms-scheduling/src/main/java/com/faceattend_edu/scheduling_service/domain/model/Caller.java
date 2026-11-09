package com.faceattend_edu.scheduling_service.domain.model;

/**
 * Who is acting, as the application layer needs it to apply the access rules.
 *
 * @param restricted  confined to one school (everyone but Super Administrador)
 * @param schoolId    the caller's own school; null when unrestricted or unresolved
 * @param actorId     the caller's own academic_actor, stamped as opened_by/closed_by; may be null
 * @param schoolAdmin the caller administers their school (role Administrador)
 */
public record Caller(boolean restricted, Integer schoolId, Long actorId, boolean schoolAdmin) {

    /** No school restriction and no academic actor: internal callers and tests. */
    public static final Caller UNRESTRICTED = new Caller(false, null, null, false);

    /** An unrestricted caller that still has its own academic actor. */
    public static Caller unrestricted(Long actorId) {
        return new Caller(false, null, actorId, false);
    }

    /** Whether a record of {@code otherSchoolId} is visible to this caller. */
    public boolean allowsSchool(Integer otherSchoolId) {
        return !restricted || (otherSchoolId != null && otherSchoolId.equals(schoolId));
    }

    /** The school a listing must be confined to, or null for "every school". */
    public Integer scopeSchoolId() {
        return restricted ? schoolId : null;
    }

    /** A restricted caller with no resolved school sees nothing (fail closed). */
    public boolean seesNothing() {
        return restricted && schoolId == null;
    }
}
