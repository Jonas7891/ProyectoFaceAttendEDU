package com.faceattend_edu.shared.auth;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * The school a caller may manage. Super Administrador (no school of its own) is
 * unrestricted; everyone else is confined to the school of their own academic_actor,
 * resolved user -> person (identity) -> actors (academic) with the caller's token and
 * never trusted from the request. A caller without one gets no school, which must fail
 * secure (own nothing). Answers are cached per user for {@link #TTL_MS}.
 *
 * <p>Each service extends it with its own Spring bean: it supplies the service URLs and
 * may wrap the calls in {@link #call} (a retry, for example).</p>
 */
public abstract class CallerSchoolLookup {

    /** What the lookup found. {@code actorId} is the caller's own actor in that school. */
    public record Membership(boolean superAdmin, Integer schoolId, Long actorId) {
        public static final Membership SUPER_ADMIN = new Membership(true, null, null);
        public static final Membership NONE = new Membership(false, null, null);
    }

    public static final long TTL_MS = 30_000;

    private record Cached(Membership value, long expiresAt) {}

    private final RestTemplate restTemplate;
    private final Map<String, Cached> cache = new ConcurrentHashMap<>();

    protected CallerSchoolLookup(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /** A RestTemplate with a 3 s connect timeout and the given read timeout. */
    public static RestTemplate restTemplate(int readTimeoutMs) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(readTimeoutMs);
        return new RestTemplate(factory);
    }

    protected abstract String identityUrl();

    protected abstract String academicUrl();

    /** @throws RuntimeException if identity or academic do not answer (the caller answers 503). */
    public Membership lookup(String userId, List<String> roles, String token) {
        if (roles.contains(Roles.SUPER_ADMIN)) return Membership.SUPER_ADMIN;

        Cached hit = cache.get(userId);
        if (hit != null && hit.expiresAt() > System.currentTimeMillis()) return hit.value();

        Map<?, ?> user = getMap(identityUrl() + "/api/v1/users/" + userId, token);
        String personId = user == null ? null : String.valueOf(user.get("personId"));
        Membership found = Membership.NONE;
        if (personId != null && !"null".equals(personId)) {
            for (Map<?, ?> actor : getList(academicUrl() + "/api/v1/academic-actors?personId=" + personId, token)) {
                if (actor.get("schoolId") instanceof Number school) {
                    Object actorId = actor.get("academicActorId");
                    found = new Membership(false, school.intValue(), actorId instanceof Number n ? n.longValue() : null);
                    break;
                }
            }
        }
        cache.put(userId, new Cached(found, System.currentTimeMillis() + TTL_MS));
        return found;
    }

    /** Runs one remote call; override to add a retry. */
    protected <T> T call(Supplier<T> request) {
        return request.get();
    }

    protected Map<?, ?> getMap(String url, String token) {
        return call(() -> restTemplate.exchange(url, HttpMethod.GET, bearer(token), Map.class).getBody());
    }

    @SuppressWarnings("unchecked")
    protected List<Map<?, ?>> getList(String url, String token) {
        List<Map<?, ?>> body = call(() -> restTemplate.exchange(url, HttpMethod.GET, bearer(token), List.class).getBody());
        return body == null ? List.of() : body;
    }

    private static HttpEntity<Void> bearer(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return new HttpEntity<>(headers);
    }
}
