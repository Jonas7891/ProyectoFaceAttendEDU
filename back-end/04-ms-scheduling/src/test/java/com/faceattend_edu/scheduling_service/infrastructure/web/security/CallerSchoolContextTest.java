package com.faceattend_edu.scheduling_service.infrastructure.web.security;

import com.faceattend_edu.scheduling_service.domain.model.Caller;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CallerSchoolContextTest {

    @AfterEach
    void clear() {
        RequestContextHolder.resetRequestAttributes();
    }

    private static MockHttpServletRequest scope(CallerSchoolResolver.CallerSchool value) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        if (value != null) request.setAttribute(AuthTokenFilter.CALLER_SCHOOL_ATTRIBUTE, value);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        return request;
    }

    @Test
    void noAttributeMeansUnrestricted_sameConventionAsActorScope() {
        scope(null);
        Caller caller = CallerSchoolContext.caller();
        assertThat(caller.restricted()).isFalse();
        assertThat(caller.allowsSchool(999)).isTrue();
        assertThat(caller.schoolId()).isNull();
        assertThat(caller.scopeSchoolId()).isNull();
    }

    @Test
    void superAdminIsUnrestricted() {
        scope(CallerSchoolResolver.CallerSchool.SUPER_ADMIN);
        Caller caller = CallerSchoolContext.caller();
        assertThat(caller.restricted()).isFalse();
        assertThat(caller.allowsSchool(1)).isTrue();
        assertThat(caller.allowsSchool(999)).isTrue();
    }

    @Test
    void schoolAdminOnlyAllowsOwnSchool() {
        scope(new CallerSchoolResolver.CallerSchool(false, 100, 5L)).setAttribute("X-User-Roles", List.of("Administrador"));
        Caller caller = CallerSchoolContext.caller();
        assertThat(caller.restricted()).isTrue();
        assertThat(caller.allowsSchool(100)).isTrue();
        assertThat(caller.allowsSchool(200)).isFalse();
        assertThat(caller.scopeSchoolId()).isEqualTo(100);
        assertThat(caller.actorId()).isEqualTo(5L);
        assertThat(caller.schoolAdmin()).isTrue();
    }

    @Test
    void callerWithoutOwnSchoolFailsSecureAllowingNothing() {
        scope(new CallerSchoolResolver.CallerSchool(false, null, null));
        Caller caller = CallerSchoolContext.caller();
        assertThat(caller.restricted()).isTrue();
        assertThat(caller.seesNothing()).isTrue();
        assertThat(caller.allowsSchool(1)).isFalse();
        assertThat(caller.allowsSchool(null)).isFalse();
        assertThat(caller.schoolAdmin()).isFalse();
    }
}
