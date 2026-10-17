package com.faceattend_edu.identity_service.adapter.in.web.security;

import com.faceattend_edu.identity_service.application.port.out.LoadUserPort;
import com.faceattend_edu.identity_service.domain.model.User;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Personas que quien llama puede ver. Administrador: todas. El resto: la propia,
 * los aprendices matriculados en las fichas donde dicta (instructor) y los
 * instructores de las fichas donde está matriculado (aprendiz). Se calcula con
 * el bearer del llamante contra academic y scheduling y se cachea 60 s.
 * Duplicado intencional por MS, igual que AuthTokenFilter.
 */
@Component
public class CallerScopeResolver {

    /** {@code null} en personIds significa sin restricción (administrador). */
    public record Scope(Set<UUID> personIds) {
        public boolean all() { return personIds == null; }
        public boolean allows(UUID personId) { return all() || personIds.contains(personId); }
    }

    static final Set<String> ADMIN_ROLES = Set.of("Administrador", "Super Administrador");
    private static final long TTL_MS = 60_000;
    private static final Scope ALL = new Scope(null);

    private record Cached(Scope scope, long expiresAt) {}

    private final RestTemplate restTemplate;
    private final ObjectProvider<LoadUserPort> loadUserPort;
    private final Map<String, Cached> cache = new ConcurrentHashMap<>();

    @Value("${faceattend.auth.academic-url:http://localhost:8083}")
    private String academicUrl;

    @Value("${faceattend.auth.scheduling-url:http://localhost:8084}")
    private String schedulingUrl;

    public CallerScopeResolver(ObjectProvider<LoadUserPort> loadUserPort) {
        this.loadUserPort = loadUserPort;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(5000);
        this.restTemplate = new RestTemplate(factory);
    }

    /** @throws RuntimeException si academic/scheduling no responden (el filtro responde 503). */
    public Scope resolve(String userId, List<String> roles, String token) {
        if (roles.stream().anyMatch(ADMIN_ROLES::contains)) return ALL;
        Cached hit = cache.get(userId);
        if (hit != null && hit.expiresAt() > System.currentTimeMillis()) return hit.scope();

        LoadUserPort port = loadUserPort.getIfAvailable();
        User user = port == null ? null : port.loadUser(UUID.fromString(userId));
        Set<UUID> persons = new HashSet<>();
        if (user == null || user.getPersonId() == null || user.getPersonId().getPersonId() == null) {
            return new Scope(persons);
        }
        UUID ownPerson = user.getPersonId().getPersonId();
        persons.add(ownPerson);

        Map<String, String> personByActor = new HashMap<>();
        Set<String> ownActors = new HashSet<>();
        // Sin ?limit academic devuelve todos los actores; con ?limit se cortaba en 100 y el mapa
        // actor -> persona quedaba incompleto (el instructor no encontraba su actor ni a sus aprendices).
        for (Map<?, ?> actor : getList(academicUrl + "/api/v1/academic-actors", token)) {
            String actorId = String.valueOf(actor.get("academicActorId"));
            String personId = String.valueOf(actor.get("personId"));
            personByActor.put(actorId, personId);
            if (ownPerson.toString().equalsIgnoreCase(personId)) ownActors.add(actorId);
        }

        for (String actorId : ownActors) {
            // Instructor: aprendices activos de las fichas que dicta.
            for (Map<?, ?> block : getList(schedulingUrl + "/api/v1/schedule-blocks?instructorActorId=" + actorId, token)) {
                for (Map<?, ?> enrollment : getList(academicUrl + "/api/v1/cohorts/" + block.get("cohortId") + "/enrollments", token)) {
                    if ("Active".equals(enrollment.get("enrollmentStatus"))) {
                        addPerson(persons, personByActor.get(String.valueOf(enrollment.get("academicActorId"))));
                    }
                }
            }
            // Aprendiz: instructores de las fichas en las que está matriculado.
            for (Map<?, ?> enrollment : getList(academicUrl + "/api/v1/academic-actors/" + actorId + "/enrollments", token)) {
                for (Map<?, ?> block : getList(schedulingUrl + "/api/v1/schedule-blocks?cohortId=" + enrollment.get("cohortId"), token)) {
                    addPerson(persons, personByActor.get(String.valueOf(block.get("instructorActorId"))));
                }
            }
        }
        Scope scope = new Scope(Set.copyOf(persons));
        cache.put(userId, new Cached(scope, System.currentTimeMillis() + TTL_MS));
        return scope;
    }

    private static void addPerson(Set<UUID> persons, String personId) {
        if (personId == null) return;
        try {
            persons.add(UUID.fromString(personId));
        } catch (IllegalArgumentException ignored) {
            // actor sin persona válida: no amplía el alcance
        }
    }

    @SuppressWarnings("unchecked")
    protected List<Map<?, ?>> getList(String url, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        List<Map<?, ?>> body = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), List.class).getBody();
        return body == null ? List.of() : body;
    }
}
