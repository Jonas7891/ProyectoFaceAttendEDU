package com.faceattend_edu.attendance_service.infrastructure.web.security;

import com.faceattend_edu.shared.auth.CallerSchoolLookup;
import com.faceattend_edu.shared.auth.Roles;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.function.Supplier;

/**
 * The school a caller may manage justification types for. The lookup itself (Super
 * Administrador shortcut, user -> person -> actor, cache) lives in back-end/shared/auth-java
 * ({@link CallerSchoolLookup}); this service adds one retry on transient I/O failures.
 * `justification_type.school_id` is nullable (NULL = global catalog, shared by every
 * school; only Super Administrador may touch those).
 */
@Component
public class CallerSchoolResolver extends CallerSchoolLookup {

    public record CallerSchool(boolean isSuperAdmin, Integer schoolId) {
        static final CallerSchool SUPER_ADMIN = new CallerSchool(true, null);
    }

    static final String SUPER_ADMIN_ROLE = Roles.SUPER_ADMIN;

    @Value("${faceattend.auth.identity-url:http://localhost:8081}")
    private String identityUrl;

    @Value("${faceattend.auth.academic-url:http://localhost:8083}")
    private String academicUrl;

    public CallerSchoolResolver() {
        this(restTemplate(8000));
    }

    CallerSchoolResolver(RestTemplate restTemplate) {
        super(restTemplate);
    }

    @Override
    protected String identityUrl() {
        return identityUrl;
    }

    @Override
    protected String academicUrl() {
        return academicUrl;
    }

    @Override
    protected <T> T call(Supplier<T> request) {
        return TransientRetry.call(request);
    }

    /** @throws RuntimeException if identity/academic do not respond (the filter answers 503). */
    public CallerSchool resolve(String userId, List<String> roles, String token) {
        Membership m = lookup(userId, roles, token);
        return m.superAdmin() ? CallerSchool.SUPER_ADMIN : new CallerSchool(false, m.schoolId());
    }
}
