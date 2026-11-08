package com.faceattend_edu.scheduling_service.infrastructure.web.security;

import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.infrastructure.web.security.CallerSchoolResolver.CallerSchool;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

/**
 * Translates the current request into the {@link Caller} the use cases decide with: the
 * {@link CallerSchool} set by {@link AuthTokenFilter} plus the roles it propagates. The access
 * rules themselves live in {@code application.access.SchedulingAccessPolicy}.
 *
 * <p>Absent (tests without the filter, or the resolver unavailable) means unrestricted, the same
 * "no attribute = admin" convention as 05-attendance's ActorScope.</p>
 */
public final class CallerSchoolContext {

    private CallerSchoolContext() {}

    /** The caller of the current request. */
    public static Caller caller() {
        return new Caller(restricted(), ownSchoolId(), ownActorId(), isSchoolAdmin());
    }

    private static CallerSchool current() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        Object value = attributes == null
                ? null
                : attributes.getAttribute(AuthTokenFilter.CALLER_SCHOOL_ATTRIBUTE, RequestAttributes.SCOPE_REQUEST);
        return value instanceof CallerSchool cs ? cs : null;
    }

    /** Whether the current caller is confined to a single school (i.e. not Super Administrador). */
    public static boolean restricted() {
        CallerSchool cs = current();
        return cs != null && !cs.isSuperAdmin();
    }

    /** The caller's own school, or null for Super Administrador / no attribute (unrestricted). */
    public static Integer ownSchoolId() {
        CallerSchool cs = current();
        return cs == null ? null : cs.schoolId();
    }

    /** Whether the caller administers their school (role propagated by AuthTokenFilter as X-User-Roles). */
    public static boolean isSchoolAdmin() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        Object roles = attributes == null ? null : attributes.getAttribute("X-User-Roles", RequestAttributes.SCOPE_REQUEST);
        return roles instanceof java.util.List<?> list && list.contains("Administrador");
    }

    /** The caller's own academic_actor in their school, for stamping opened_by/closed_by. */
    public static Long ownActorId() {
        CallerSchool cs = current();
        return cs == null ? null : cs.ownActorId();
    }
}
