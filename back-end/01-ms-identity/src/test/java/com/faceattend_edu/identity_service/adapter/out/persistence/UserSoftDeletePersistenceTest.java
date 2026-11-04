package com.faceattend_edu.identity_service.adapter.out.persistence;

import com.faceattend_edu.identity_service.adapter.out.persistence.crypto.SessionTokenHasher;
import com.faceattend_edu.identity_service.adapter.out.persistence.entity.PersonJpaEntity;
import com.faceattend_edu.identity_service.adapter.out.persistence.entity.UserJpaEntity;
import com.faceattend_edu.identity_service.adapter.out.persistence.mapper.PersonPersistenceMapper;
import com.faceattend_edu.identity_service.adapter.out.persistence.mapper.UserPersistenceMapper;
import com.faceattend_edu.identity_service.adapter.out.persistence.mapper.UserSessionPersistenceMapper;
import com.faceattend_edu.identity_service.adapter.out.persistence.repository.PersonJpaRepository;
import com.faceattend_edu.identity_service.adapter.out.persistence.repository.UserJpaRepository;
import com.faceattend_edu.identity_service.adapter.out.persistence.repository.UserSessionJpaRepository;
import com.faceattend_edu.identity_service.domain.model.UserSession;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/** AUD-74 against a real (H2) database: the soft delete fills the audit columns and is applied once. */
@DataJpaTest(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.hbm2ddl.create_namespaces=true",
        "spring.datasource.url=jdbc:h2:mem:softdelete;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;DB_CLOSE_DELAY=-1;INIT=RUNSCRIPT FROM 'classpath:session-roundtrip-schema.sql'",
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@DisplayName("Soft delete of app_user")
class UserSoftDeletePersistenceTest {

    @Autowired PersonJpaRepository people;
    @Autowired UserJpaRepository users;
    @Autowired UserSessionJpaRepository sessions;
    @Autowired EntityManager em;

    private UserPersistenceAdapter userAdapter;
    private UserSessionPersistenceAdapter sessionAdapter;
    private UserJpaEntity user;
    private final UUID admin = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        for (String table : new String[]{"person", "app_user", "user_session"}) {
            em.createNativeQuery("alter table \"identity\".\"" + table + "\" alter column \"row_version\" set default 1").executeUpdate();
        }
        PersonPersistenceMapper personMapper = new PersonPersistenceMapper();
        UserPersistenceMapper userMapper = new UserPersistenceMapper(personMapper);
        userAdapter = new UserPersistenceAdapter(users, people, userMapper);
        sessionAdapter = new UserSessionPersistenceAdapter(sessions, new UserSessionPersistenceMapper(userMapper));

        PersonJpaEntity p = new PersonJpaEntity();
        p.setDocumentType("CC");
        p.setDocumentNumber("1015407712");
        p.setName("Ana");
        p.setLastName("Rios");
        p.setEmail("ana@sede.edu.co");
        p.setStatus(true);
        p.setCreatedAt(LocalDateTime.now());
        p = people.saveAndFlush(p);

        user = new UserJpaEntity();
        user.setPerson(p);
        user.setUsername("ana.rios");
        user.setPasswordHash("x");
        user.setAuthenticationType("Local");
        user.setStatus(true);
        user.setCreatedAt(LocalDateTime.now());
        user = users.saveAndFlush(user);
    }

    @Test
    @DisplayName("fills deleted_at and deleted_by, turns status off and hides the row from the roster")
    void marksTheRowDeleted() {
        LocalDateTime now = LocalDateTime.now();

        int rows = userAdapter.softDeleteUser(user.getUserId(), admin, now);
        em.flush();
        em.clear();

        assertThat(rows).isEqualTo(1);
        UserJpaEntity stored = users.findById(user.getUserId()).orElseThrow();
        assertThat(stored.getDeletedAt()).isNotNull();
        assertThat(stored.getDeletedBy()).isEqualTo(admin);
        assertThat(stored.getUpdatedBy()).isEqualTo(admin);
        assertThat(stored.getStatus()).isFalse();
        assertThat(userAdapter.countUsers()).isZero();
    }

    @Test
    @DisplayName("a second delete changes nothing and reports zero rows")
    void secondDeleteIsANoOp() {
        LocalDateTime first = LocalDateTime.now().minusMinutes(5);
        userAdapter.softDeleteUser(user.getUserId(), admin, first);
        em.flush();
        em.clear();

        int rows = userAdapter.softDeleteUser(user.getUserId(), UUID.randomUUID(), LocalDateTime.now());
        em.flush();
        em.clear();

        assertThat(rows).isZero();
        assertThat(users.findById(user.getUserId()).orElseThrow().getDeletedBy()).isEqualTo(admin);
    }

    @Test
    @DisplayName("closes only the active sessions of that user")
    void closesActiveSessionsOfTheUser() {
        UserSession active = new UserSession();
        active.setUserId(new UserPersistenceMapper(new PersonPersistenceMapper()).toDomain(user));
        active.start();
        UUID token = sessionAdapter.saveUserSession(active).getSessionId();
        em.flush();
        em.clear();

        int closed = sessionAdapter.closeActiveSessionsOfUser(user.getUserId(), LocalDateTime.now());
        em.flush();
        em.clear();

        assertThat(closed).isEqualTo(1);
        UserSession reloaded = sessionAdapter.loadUserSession(token);
        assertThat(reloaded.getSessionStatus()).isEqualTo(UserSession.STATUS_CLOSED);
        assertThat(reloaded.getEndDate()).isNotNull();
        assertThat(sessionAdapter.closeActiveSessionsOfUser(user.getUserId(), LocalDateTime.now())).isZero();
        assertThat(SessionTokenHasher.hash(token)).isNotNull();
    }
}
