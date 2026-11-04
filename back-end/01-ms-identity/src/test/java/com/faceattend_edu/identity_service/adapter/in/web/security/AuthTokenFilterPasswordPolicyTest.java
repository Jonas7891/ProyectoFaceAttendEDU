package com.faceattend_edu.identity_service.adapter.in.web.security;

import com.faceattend_edu.shared.auth.SessionAuthClient;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.support.StaticListableBeanFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * La política de contraseñas es una sola para toda la plataforma (AUD-66): leerla
 * lo puede cualquier rol, escribirla solo el Super Administrador.
 */
class AuthTokenFilterPasswordPolicyTest {

    private static final String USER = "a0000000-0000-4000-8000-000000000001";
    private static final String TOKEN = "d0000000-0000-4000-8000-000000000001";

    private MockHttpServletResponse run(String role, String method, String path, FilterChain chain) throws Exception {
        ObjectProvider<Object> none = new StaticListableBeanFactory().getBeanProvider(Object.class);
        @SuppressWarnings({"unchecked", "rawtypes"})
        AuthTokenFilter filter = new AuthTokenFilter((ObjectProvider) none, (ObjectProvider) none,
                (ObjectProvider) none, "http://identity", "http://authorization");
        RestTemplate rest = mock(RestTemplate.class);
        when(rest.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class))).thenAnswer(inv -> {
            String url = inv.getArgument(0);
            if (url.contains("/sessions/")) {
                return ResponseEntity.ok(Map.of("sessionStatus", "Active", "userId", USER));
            }
            return ResponseEntity.ok(Map.of("allowed", true));
        });
        when(rest.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(List.class)))
                .thenReturn(ResponseEntity.ok(List.of(Map.of("roleName", role))));
        ReflectionTestUtils.setField(filter, "sessionAuth",
                new SessionAuthClient(rest, "http://identity", "http://authorization"));
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.addHeader("Authorization", "Bearer " + TOKEN);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, chain);
        return response;
    }

    @Test
    void aSchoolAdministratorCannotWriteThePasswordPolicy() throws Exception {
        for (String[] call : new String[][] {{"POST", "/api/v1/password-policies"}, {"PUT", "/api/v1/password-policies/1"}}) {
            FilterChain chain = mock(FilterChain.class);
            assertEquals(403, run("Administrador", call[0], call[1], chain).getStatus(), call[0]);
            verify(chain, never()).doFilter(any(), any());
        }
    }

    @Test
    void theSuperAdministratorStillWritesThePasswordPolicy() throws Exception {
        for (String[] call : new String[][] {{"POST", "/api/v1/password-policies"}, {"PUT", "/api/v1/password-policies/1"}}) {
            FilterChain chain = mock(FilterChain.class);
            assertEquals(200, run("Super Administrador", call[0], call[1], chain).getStatus(), call[0]);
            verify(chain).doFilter(any(), any());
        }
    }

    @Test
    void everyRoleStillReadsThePasswordPolicy() throws Exception {
        for (String role : List.of("Administrador", "Instructor", "Aprendiz")) {
            FilterChain chain = mock(FilterChain.class);
            assertEquals(200, run(role, "GET", "/api/v1/password-policies", chain).getStatus(), role);
            verify(chain).doFilter(any(), any());
        }
    }
}
