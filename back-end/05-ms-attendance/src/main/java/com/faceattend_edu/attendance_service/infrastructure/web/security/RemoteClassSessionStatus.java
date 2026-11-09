package com.faceattend_edu.attendance_service.infrastructure.web.security;

import com.faceattend_edu.attendance_service.domain.exception.DependencyUnavailableException;
import com.faceattend_edu.attendance_service.domain.port.out.ClassSessionStatusPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

/**
 * Asks Scheduling for a session's status with the caller's own token. Not cached: the status
 * changes when the instructor closes the class, and a stale Open would let records in.
 */
@Component
public class RemoteClassSessionStatus implements ClassSessionStatusPort {

    private final RestTemplate restTemplate;

    @Value("${faceattend.auth.scheduling-url:http://localhost:8084}")
    private String schedulingUrl;

    public RemoteClassSessionStatus() {
        this(buildRestTemplate());
    }

    RemoteClassSessionStatus(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private static RestTemplate buildRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000);
        factory.setReadTimeout(4000);
        return new RestTemplate(factory);
    }

    @Override
    public Optional<String> statusOf(Long classSessionId) {
        String token = CallerToken.current();
        if (token == null) {
            throw new DependencyUnavailableException("Cannot check the class session without the caller's token");
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        try {
            Map<?, ?> session = TransientRetry.call(() -> restTemplate.exchange(
                    schedulingUrl + "/api/v1/class-sessions/" + classSessionId, HttpMethod.GET,
                    new HttpEntity<>(headers), Map.class).getBody());
            Object status = session == null ? null : session.get("sessionStatus");
            if (status == null) throw new DependencyUnavailableException("Scheduling answered without a session status");
            return Optional.of(String.valueOf(status));
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        } catch (RestClientException e) {
            throw new DependencyUnavailableException("Scheduling is unavailable, try again later", e);
        }
    }
}
