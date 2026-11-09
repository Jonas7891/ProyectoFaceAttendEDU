package com.faceattend_edu.scheduling_service.infrastructure.web.security;

import com.faceattend_edu.shared.auth.CallerSchoolLookup;
import com.faceattend_edu.shared.auth.Roles;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * The school a caller may manage: environments, schedule blocks and class sessions all
 * trace back to a school (environment.school_id directly; the rest through environment).
 * The lookup itself (Super Administrador shortcut, user -> person -> actor, cache) lives
 * in back-end/shared/auth-java ({@link CallerSchoolLookup}). `ownActorId` is the caller's
 * own academic_actor in that school, used to stamp class_session.opened_by/closed_by
 * instead of trusting the request body.
 */
@Component
public class CallerSchoolResolver extends CallerSchoolLookup {

    public record CallerSchool(boolean isSuperAdmin, Integer schoolId, Long ownActorId) {
        static final CallerSchool SUPER_ADMIN = new CallerSchool(true, null, null);
    }

    static final String SUPER_ADMIN_ROLE = Roles.SUPER_ADMIN;

    @Value("${faceattend.auth.identity-url:http://localhost:8081}")
    private String identityUrl;

    @Value("${faceattend.auth.academic-url:http://localhost:8083}")
    private String academicUrl;

    public CallerSchoolResolver() {
        this(restTemplate(5000));
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

    /** @throws RuntimeException if identity/academic do not respond (the controller answers 503). */
    public CallerSchool resolve(String userId, List<String> roles, String token) {
        Membership m = lookup(userId, roles, token);
        return m.superAdmin() ? CallerSchool.SUPER_ADMIN : new CallerSchool(false, m.schoolId(), m.actorId());
    }
}
