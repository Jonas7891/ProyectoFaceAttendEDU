package com.faceattend_edu.identity_service.adapter.in.web.security;

import com.faceattend_edu.identity_service.application.port.out.LoadUserPort;
import com.faceattend_edu.identity_service.domain.model.Person;
import com.faceattend_edu.identity_service.domain.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.support.StaticListableBeanFactory;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class CallerScopeResolverTest {

    private static final UUID TEACHER = UUID.fromString("10000000-0000-4000-8000-000000000001");
    private static final UUID STUDENT = UUID.fromString("20000000-0000-4000-8000-000000000002");
    private static final UUID OTHER_STUDENT = UUID.fromString("30000000-0000-4000-8000-000000000003");
    private static final UUID OTHER_TEACHER = UUID.fromString("40000000-0000-4000-8000-000000000004");

    /** Actores: 1 instructor (TEACHER), 2 aprendiz (STUDENT, ficha 7), 3 aprendiz de otra ficha, 4 otro instructor. */
    private static final Map<String, List<Map<?, ?>>> BACKEND = Map.of(
            "/api/v1/academic-actors", List.of(
                    Map.of("academicActorId", 1, "personId", TEACHER.toString()),
                    Map.of("academicActorId", 2, "personId", STUDENT.toString()),
                    Map.of("academicActorId", 3, "personId", OTHER_STUDENT.toString()),
                    Map.of("academicActorId", 4, "personId", OTHER_TEACHER.toString())),
            "/api/v1/schedule-blocks?instructorActorId=1", List.of(Map.of("cohortId", 7)),
            "/api/v1/cohorts/7/enrollments", List.of(Map.of("academicActorId", 2, "enrollmentStatus", "Active")),
            "/api/v1/academic-actors/2/enrollments", List.of(Map.of("cohortId", 7)),
            "/api/v1/schedule-blocks?cohortId=7", List.of(Map.of("instructorActorId", 1)));

    private CallerScopeResolver resolverFor(UUID person) {
        User user = new User();
        user.setUserId(UUID.randomUUID());
        Person p = new Person();
        p.setPersonId(person);
        user.setPersonId(p);
        StaticListableBeanFactory beans = new StaticListableBeanFactory(Map.of("users", (LoadUserPort) id -> user));
        ObjectProvider<LoadUserPort> provider = beans.getBeanProvider(LoadUserPort.class);
        return new CallerScopeResolver(provider) {
            @Override
            protected List<Map<?, ?>> getList(String url, String token) {
                String path = url.substring(url.indexOf("/api/"));
                return BACKEND.getOrDefault(path, List.of());
            }
        };
    }

    @Test
    void adminSeesEveryone() {
        assertThat(resolverFor(TEACHER).resolve(UUID.randomUUID().toString(), List.of("Administrador"), "t").all()).isTrue();
    }

    @Test
    void instructorSeesSelfAndOwnStudentsOnly() {
        CallerScopeResolver.Scope scope = resolverFor(TEACHER).resolve(UUID.randomUUID().toString(), List.of("Instructor"), "t");
        assertThat(scope.personIds()).containsExactlyInAnyOrder(TEACHER, STUDENT);
    }

    @Test
    void apprenticeSeesSelfAndOwnInstructorsOnly() {
        CallerScopeResolver.Scope scope = resolverFor(STUDENT).resolve(UUID.randomUUID().toString(), List.of("Aprendiz"), "t");
        assertThat(scope.personIds()).containsExactlyInAnyOrder(STUDENT, TEACHER);
        assertThat(scope.allows(OTHER_STUDENT)).isFalse();
        assertThat(scope.allows(OTHER_TEACHER)).isFalse();
    }
}
