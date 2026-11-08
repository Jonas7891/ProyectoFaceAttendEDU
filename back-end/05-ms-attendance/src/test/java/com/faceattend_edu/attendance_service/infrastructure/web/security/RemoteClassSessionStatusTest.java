package com.faceattend_edu.attendance_service.infrastructure.web.security;

import com.faceattend_edu.attendance_service.application.policy.SessionOpenPolicy;
import com.faceattend_edu.attendance_service.domain.exception.DependencyUnavailableException;
import com.faceattend_edu.attendance_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.attendance_service.domain.exception.ValidationException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** M4: attendance follows the session status from Scheduling and fails closed when it cannot ask. */
class RemoteClassSessionStatusTest {

    private static final String URL = "http://scheduling/api/v1/class-sessions/5";

    private final RestTemplate rest = mock(RestTemplate.class);
    private final RemoteClassSessionStatus port = new RemoteClassSessionStatus(rest);
    private final SessionOpenPolicy policy = new SessionOpenPolicy(port);

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(port, "schedulingUrl", "http://scheduling");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setAttribute(CallerToken.ATTRIBUTE, "caller-token");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }

    @AfterEach
    void clear() {
        RequestContextHolder.resetRequestAttributes();
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private void schedulingAnswers(Map<String, Object> body) {
        when(rest.exchange(eq(URL), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn((ResponseEntity) ResponseEntity.ok(body));
    }

    @SuppressWarnings("unchecked")
    private void schedulingFails(RuntimeException error) {
        when(rest.exchange(eq(URL), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class))).thenThrow(error);
    }

    @Test
    void anOpenSessionTakesAnyRecord() {
        schedulingAnswers(Map.of("sessionStatus", "Open"));
        assertThat(port.statusOf(5L)).contains("Open");
        assertThatCode(() -> policy.requireAccepts(5L, "Present")).doesNotThrowAnyException();
    }

    @Test
    void aClosedSessionOnlyTakesTheAbsencesNotificationRecordsAfterTheClose() {
        schedulingAnswers(Map.of("sessionStatus", "Closed"));
        assertThatCode(() -> policy.requireAccepts(5L, "Absent")).doesNotThrowAnyException();
        assertThatThrownBy(() -> policy.requireAccepts(5L, "Present"))
                .isInstanceOf(ValidationException.class).hasMessageContaining("session 5 is Closed");
    }

    @Test
    void aCancelledSessionTakesNothing() {
        schedulingAnswers(Map.of("sessionStatus", "Cancelled"));
        assertThatThrownBy(() -> policy.requireAccepts(5L, "Absent")).isInstanceOf(ValidationException.class);
    }

    @Test
    void aSessionSchedulingDoesNotKnowIs404() {
        schedulingFails(HttpClientErrorException.create(HttpStatus.NOT_FOUND, "nf", null, null, null));
        assertThat(port.statusOf(5L)).isEmpty();
        assertThatThrownBy(() -> policy.requireAccepts(5L, "Present")).isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void whenSchedulingCannotAnswerTheRecordIsRefusedNotGuessed() {
        schedulingFails(new ResourceAccessException("connection refused"));
        assertThatThrownBy(() -> port.statusOf(5L)).isInstanceOf(DependencyUnavailableException.class);

        RemoteClassSessionStatus serverError = new RemoteClassSessionStatus(rest);
        ReflectionTestUtils.setField(serverError, "schedulingUrl", "http://other");
        when(rest.exchange(eq("http://other/api/v1/class-sessions/5"), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenThrow(HttpServerErrorException.create(HttpStatus.BAD_GATEWAY, "bg", null, null, null));
        assertThatThrownBy(() -> serverError.statusOf(5L)).isInstanceOf(DependencyUnavailableException.class);
    }

    @Test
    void anAnswerWithoutStatusOrACallWithoutTokenIsUnavailable() {
        schedulingAnswers(Map.of("classSessionId", 5));
        assertThatThrownBy(() -> port.statusOf(5L)).isInstanceOf(DependencyUnavailableException.class);

        RequestContextHolder.resetRequestAttributes();
        assertThatThrownBy(() -> port.statusOf(Optional.of(5L).get())).isInstanceOf(DependencyUnavailableException.class);
    }
}
