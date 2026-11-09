package com.faceattend_edu.shared.auth;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class CallerSchoolLookupTest {

    private static class Lookup extends CallerSchoolLookup {
        Lookup(RestTemplate rest) {
            super(rest);
        }

        @Override
        protected String identityUrl() {
            return "http://identity";
        }

        @Override
        protected String academicUrl() {
            return "http://academic";
        }
    }

    @SuppressWarnings("unchecked")
    private static RestTemplate backend(Object user, List<?> actors) {
        RestTemplate rest = mock(RestTemplate.class);
        when(rest.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn((ResponseEntity) ResponseEntity.ok(user));
        when(rest.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(List.class)))
                .thenReturn((ResponseEntity) ResponseEntity.ok(actors));
        return rest;
    }

    @Test
    void aSuperAdministradorIsUnrestrictedWithoutAnyCall() {
        RestTemplate rest = mock(RestTemplate.class);

        assertThat(new Lookup(rest).lookup("u", List.of(Roles.SUPER_ADMIN), "t"))
                .isEqualTo(CallerSchoolLookup.Membership.SUPER_ADMIN);
        verifyNoInteractions(rest);
    }

    @Test
    void anAdministradorGetsTheSchoolAndActorOfTheirFirstActorWithASchool() {
        RestTemplate rest = backend(Map.of("personId", "p1"),
                List.of(Map.of("academicActorId", 4), Map.of("academicActorId", 9, "schoolId", 7)));

        assertThat(new Lookup(rest).lookup("u", List.of(Roles.SCHOOL_ADMIN), "t"))
                .isEqualTo(new CallerSchoolLookup.Membership(false, 7, 9L));
    }

    @Test
    void aCallerWithoutAPersonOrAnActorFailsSecureToNoSchool() {
        assertThat(new Lookup(backend(Map.of(), List.of())).lookup("u1", List.of(Roles.INSTRUCTOR), "t"))
                .isEqualTo(CallerSchoolLookup.Membership.NONE);
        assertThat(new Lookup(backend(Map.of("personId", "p"), List.of())).lookup("u2", List.of(Roles.STUDENT), "t"))
                .isEqualTo(CallerSchoolLookup.Membership.NONE);
    }

    @Test
    @SuppressWarnings("unchecked")
    void theAnswerIsCachedPerUser() {
        RestTemplate rest = backend(Map.of("personId", "p1"), List.of(Map.of("schoolId", 3)));
        Lookup lookup = new Lookup(rest);

        lookup.lookup("u", List.of(Roles.SCHOOL_ADMIN), "t");
        lookup.lookup("u", List.of(Roles.SCHOOL_ADMIN), "t");

        verify(rest, times(1)).exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class));
    }

    @Test
    @SuppressWarnings("unchecked")
    void everyRemoteCallGoesThroughTheCallHookAndFailuresPropagate() {
        RestTemplate rest = mock(RestTemplate.class);
        when(rest.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenThrow(new ResourceAccessException("down"));
        AtomicInteger calls = new AtomicInteger();
        Lookup lookup = new Lookup(rest) {
            @Override
            protected <T> T call(Supplier<T> request) {
                calls.incrementAndGet();
                return request.get();
            }
        };

        assertThatThrownBy(() -> lookup.lookup("u", List.of(Roles.SCHOOL_ADMIN), "t"))
                .isInstanceOf(ResourceAccessException.class);
        assertThat(calls).hasValue(1);
    }
}
