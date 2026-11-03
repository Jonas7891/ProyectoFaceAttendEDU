package com.faceattend_edu.identity_service.adapter.out.persistence;

import com.faceattend_edu.identity_service.adapter.out.persistence.entity.DataProcessingConsentJpaEntity;
import com.faceattend_edu.identity_service.adapter.out.persistence.entity.GuardianJpaEntity;
import com.faceattend_edu.identity_service.adapter.out.persistence.entity.PersonJpaEntity;
import com.faceattend_edu.identity_service.adapter.out.persistence.entity.TermsAcceptanceJpaEntity;
import com.faceattend_edu.identity_service.adapter.out.persistence.entity.UserJpaEntity;
import com.faceattend_edu.identity_service.adapter.out.persistence.mapper.PersonPersistenceMapper;
import com.faceattend_edu.identity_service.adapter.out.persistence.mapper.UserPersistenceMapper;
import com.faceattend_edu.identity_service.adapter.out.persistence.repository.DataProcessingConsentJpaRepository;
import com.faceattend_edu.identity_service.adapter.out.persistence.repository.GuardianJpaRepository;
import com.faceattend_edu.identity_service.adapter.out.persistence.repository.PersonJpaRepository;
import com.faceattend_edu.identity_service.adapter.out.persistence.repository.TermsAcceptanceJpaRepository;
import com.faceattend_edu.identity_service.adapter.out.persistence.repository.UserJpaRepository;
import com.faceattend_edu.identity_service.domain.model.Person;
import com.faceattend_edu.identity_service.domain.model.User;
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

/**
 * AUD-23: the identity rows are born with row_version = 1 (AGENTS.md 2.2), and an account update
 * writes back the audit columns it does not manage (created_by, deleted_at, deleted_by) as they were.
 */
@DataJpaTest(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.hbm2ddl.create_namespaces=true",
        "spring.datasource.url=jdbc:h2:mem:auditcols;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;DB_CLOSE_DELAY=-1;INIT=RUNSCRIPT FROM 'classpath:session-roundtrip-schema.sql'",
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@DisplayName("Identity audit columns: row_version at birth and account updates")
class AuditColumnsRoundTripTest {

    @Autowired PersonJpaRepository people;
    @Autowired UserJpaRepository users;
    @Autowired DataProcessingConsentJpaRepository consents;
    @Autowired GuardianJpaRepository guardians;
    @Autowired TermsAcceptanceJpaRepository terms;
    @Autowired EntityManager em;

    private PersonPersistenceAdapter personAdapter;
    private UserPersistenceAdapter userAdapter;

    @BeforeEach
    void setUp() {
        // row_version of app_user is not inserted from JPA: PostgreSQL fills it with the DDL DEFAULT 1.
        em.createNativeQuery("alter table \"identity\".\"app_user\" alter column \"row_version\" set default 1").executeUpdate();
        PersonPersistenceMapper personMapper = new PersonPersistenceMapper();
        personAdapter = new PersonPersistenceAdapter(people, personMapper);
        userAdapter = new UserPersistenceAdapter(users, people, new UserPersistenceMapper(personMapper));
    }

    private Object rawValue(String table, String column, String idColumn, UUID id) {
        em.flush();
        em.clear();
        Object value = em.createNativeQuery("select \"" + column + "\" from \"identity\".\"" + table + "\" where \"" + idColumn + "\" = ?1")
                .setParameter(1, id).getSingleResult();
        // H2 hands a native UUID column back as 16 bytes.
        if (value instanceof byte[] raw && raw.length == 16) {
            java.nio.ByteBuffer buffer = java.nio.ByteBuffer.wrap(raw);
            return new UUID(buffer.getLong(), buffer.getLong());
        }
        return value;
    }

    private PersonJpaEntity savedPerson() {
        PersonJpaEntity p = new PersonJpaEntity();
        p.setDocumentType("CC");
        p.setDocumentNumber("1015407712");
        p.setName("Ana");
        p.setLastName("Rios");
        p.setEmail("ana@sede.edu.co");
        p.setStatus(true);
        p.setCreatedAt(LocalDateTime.now());
        return people.saveAndFlush(p);
    }

    private UserJpaEntity savedUser(PersonJpaEntity person, UUID createdBy, LocalDateTime deletedAt, UUID deletedBy) {
        UserJpaEntity u = new UserJpaEntity();
        u.setPerson(person);
        u.setUsername("ana.rios");
        u.setPasswordHash("x");
        u.setAuthenticationType("Local");
        u.setStatus(true);
        u.setCreatedAt(LocalDateTime.now());
        u.setCreatedBy(createdBy);
        u.setDeletedAt(deletedAt);
        u.setDeletedBy(deletedBy);
        return users.saveAndFlush(u);
    }

    @Test
    @DisplayName("a person created through the adapter is born with row_version 1")
    void aNewPersonIsBornWithRowVersionOne() {
        Person person = new Person();
        person.setDocumentType("CC");
        person.setDocumentNumber("1015407712");
        person.setName("Ana");
        person.setLastName("Rios");
        person.setStatus(true);
        person.setCreatedAt(LocalDateTime.now());

        Person saved = personAdapter.savePerson(person);

        assertThat(((Number) rawValue("person", "row_version", "person_id", saved.getPersonId())).longValue()).isEqualTo(1L);
    }

    @Test
    @DisplayName("consent, guardian and terms rows are born with row_version 1")
    void consentGuardianAndTermsAreBornWithRowVersionOne() {
        LocalDateTime now = LocalDateTime.now();

        DataProcessingConsentJpaEntity consent = new DataProcessingConsentJpaEntity();
        consent.setConsentId(UUID.randomUUID());
        consent.setPersonId(UUID.randomUUID());
        consent.setPolicyVersion("v1");
        consent.setAcceptedAt(now);
        consent.setChannel("WEB");
        consent.setCreatedAt(now);
        consent.setUpdatedAt(now);
        consents.saveAndFlush(consent);

        GuardianJpaEntity guardian = new GuardianJpaEntity();
        guardian.setGuardianId(UUID.randomUUID());
        guardian.setMinorPersonId(UUID.randomUUID());
        guardian.setFullName("Ana Gomez");
        guardian.setDocumentType("CC");
        guardian.setDocumentNumber("5005");
        guardian.setRelationship("Madre");
        guardian.setCreatedAt(now);
        guardian.setUpdatedAt(now);
        guardians.saveAndFlush(guardian);

        TermsAcceptanceJpaEntity accepted = new TermsAcceptanceJpaEntity();
        accepted.setAcceptanceId(UUID.randomUUID());
        accepted.setPersonId(UUID.randomUUID());
        accepted.setTermsVersion("v1");
        accepted.setUserType("STUDENT");
        accepted.setAcceptedBy("SELF");
        accepted.setChannel("WEB");
        accepted.setAcceptedAt(now);
        accepted.setCreatedAt(now);
        accepted.setUpdatedAt(now);
        terms.saveAndFlush(accepted);

        assertThat(((Number) rawValue("data_processing_consent", "row_version", "consent_id", consent.getConsentId())).longValue()).isEqualTo(1L);
        assertThat(((Number) rawValue("guardian", "row_version", "guardian_id", guardian.getGuardianId())).longValue()).isEqualTo(1L);
        assertThat(((Number) rawValue("terms_acceptance", "row_version", "acceptance_id", accepted.getAcceptanceId())).longValue()).isEqualTo(1L);
    }

    @Test
    @DisplayName("updating an account keeps created_by")
    void updatingAnAccountKeepsItsAuthor() {
        UUID author = UUID.randomUUID();
        UserJpaEntity stored = savedUser(savedPerson(), author, null, null);
        em.clear();

        User user = userAdapter.loadUser(stored.getUserId());
        user.setUsername("ana.r");
        userAdapter.updateUser(user);

        assertThat(rawValue("app_user", "created_by", "user_id", stored.getUserId())).isEqualTo(author);
        assertThat(rawValue("app_user", "username", "user_id", stored.getUserId())).isEqualTo("ana.r");
    }

    @Test
    @DisplayName("saving a deleted account does not bring it back")
    void savingADeletedAccountKeepsItDeleted() {
        UUID author = UUID.randomUUID();
        UUID remover = UUID.randomUUID();
        UserJpaEntity stored = savedUser(savedPerson(), author, LocalDateTime.of(2026, 10, 1, 9, 0), remover);
        em.clear();

        User user = userAdapter.loadUser(stored.getUserId());
        user.setStatus(false);
        userAdapter.updateUser(user);

        assertThat(rawValue("app_user", "deleted_at", "user_id", stored.getUserId())).isNotNull();
        assertThat(rawValue("app_user", "deleted_by", "user_id", stored.getUserId())).isEqualTo(remover);
        assertThat(rawValue("app_user", "created_by", "user_id", stored.getUserId())).isEqualTo(author);
    }
}
