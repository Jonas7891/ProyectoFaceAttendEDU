package com.faceattend_edu.identity_service.adapter.in.web.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Exige Bearer con sessionId opaco en todo /api/** salvo login/logout/me (bootstrap).
 * Valida la sesión contra el propio store vía identity, resuelve roles y evalúa
 * el permiso requerido contra authorization. Propaga X-User-Id / X-User-Roles.
 *
 * <p>Duplicado intencional por MS: el repo no tiene módulo compartido.
 * Futuro ADR-007 (JWT RS256 emitido por identity): aceptar JWT firmado aquí
 * como alternativa al sessionId opaco.</p>
 */
@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private static final List<String> PUBLIC_PREFIXES = List.of(
            "/health", "/api/v1/health", "/api/health",
            "/actuator/", "/v3/api-docs", "/swagger-ui", "/swagger-ui.html");

    private final RestTemplate restTemplate;

    @Value("${faceattend.auth.identity-url:http://localhost:8081}")
    private String identityUrl;

    @Value("${faceattend.auth.authorization-url:http://localhost:8083}")
    private String authorizationUrl;

    public AuthTokenFilter() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(5000);
        this.restTemplate = new RestTemplate(factory);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String path = request.getRequestURI();
        if (!path.startsWith("/api/") || isPublic(request.getMethod(), path)) {
            chain.doFilter(request, response);
            return;
        }

        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.regionMatches(true, 0, "Bearer ", 0, 7)) {
            deny(response, HttpServletResponse.SC_UNAUTHORIZED, "Missing bearer token", path);
            return;
        }
        UUID sessionId;
        String rawToken;
        try {
            rawToken = auth.substring(7).trim();
            sessionId = UUID.fromString(rawToken);
        } catch (IllegalArgumentException e) {
            deny(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid token format", path);
            return;
        }

        Map<?, ?> session = fetchSession(rawToken, sessionId);
        if (session == null || !"Active".equals(session.get("sessionStatus"))) {
            deny(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired session", path);
            return;
        }
        Object userId = session.get("userId");
        if (userId == null) {
            deny(response, HttpServletResponse.SC_UNAUTHORIZED, "Session without user", path);
            return;
        }
        String caller = String.valueOf(userId);

        List<String> roles = fetchRoles(rawToken, caller);
        if (roles == null) {
            deny(response, HttpServletResponse.SC_UNAUTHORIZED, "Cannot verify user roles", path);
            return;
        }

        String required = requiredPermission(request.getMethod());
        if (required != null && !evaluate(rawToken, caller, required)) {
            deny(response, HttpServletResponse.SC_FORBIDDEN, "Forbidden: requires " + required, path);
            return;
        }

        request.setAttribute("X-User-Id", caller);
        request.setAttribute("X-User-Roles", roles);
        response.setHeader("X-User-Roles", String.join(",", roles));
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                caller, null, roles.stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r.toUpperCase())).toList());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        try {
            chain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private boolean isPublic(String method, String path) {
        for (String prefix : PUBLIC_PREFIXES) {
            if (path.equals(prefix) || path.startsWith(prefix)) return true;
        }
        // Bootstrap: login/logout/me públicos; el resto de /api/** exige sesión.
        if (path.equals("/api/v1/auth/login") && method.equalsIgnoreCase("POST")) return true;
        if (path.equals("/api/v1/auth/logout") && method.equalsIgnoreCase("POST")) return true;
        return path.equals("/api/v1/auth/me") && method.equalsIgnoreCase("GET");
    }

    private String requiredPermission(String method) {
        if (method.equalsIgnoreCase("GET")) return "identity.person:read";
        return "identity.person:write";
    }

    private HttpHeaders bearerHeaders(String rawToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(rawToken);
        return headers;
    }

    @SuppressWarnings("unchecked")
    private Map<?, ?> fetchSession(String rawToken, UUID sessionId) {
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    identityUrl + "/api/v1/sessions/" + sessionId, HttpMethod.GET,
                    new HttpEntity<>(bearerHeaders(rawToken)), Map.class);
            return response.getBody();
        } catch (Exception e) {
            return null;
        }
    }

    private List<String> fetchRoles(String rawToken, String userId) {
        try {
            ResponseEntity<List> response = restTemplate.exchange(
                    authorizationUrl + "/api/v1/users/" + userId + "/roles", HttpMethod.GET,
                    new HttpEntity<>(bearerHeaders(rawToken)), List.class);
            List<?> raw = response.getBody();
            if (raw == null) return null;
            List<String> roles = new ArrayList<>();
            for (Object item : raw) {
                if (item instanceof Map<?, ?> map) {
                    Object name = map.get("roleName") != null ? map.get("roleName") : map.get("role_name");
                    if (name != null) roles.add(String.valueOf(name));
                }
            }
            return roles;
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private boolean evaluate(String rawToken, String userId, String permission) {
        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    authorizationUrl + "/api/v1/auth/evaluate?userId=" + userId + "&permission=" + permission,
                    HttpMethod.GET, new HttpEntity<>(bearerHeaders(rawToken)), Map.class);
            Map<?, ?> result = response.getBody();
            return result != null && Boolean.TRUE.equals(result.get("allowed"));
        } catch (Exception e) {
            return false;
        }
    }

    private void deny(HttpServletResponse response, int status, String message, String path) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        String safe = message.replace("\"", "'");
        String body = "{\"status\":" + status + ",\"error\":\""
                + (status == 401 ? "Unauthorized" : "Forbidden") + "\",\"message\":\"" + safe
                + "\",\"path\":\"" + path.replace("\"", "'") + "\"}";
        response.getWriter().write(body);
    }
}
