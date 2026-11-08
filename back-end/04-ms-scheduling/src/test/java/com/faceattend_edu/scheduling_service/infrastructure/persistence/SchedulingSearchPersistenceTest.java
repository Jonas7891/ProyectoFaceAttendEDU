package com.faceattend_edu.scheduling_service.infrastructure.persistence;

import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.model.ClassSessionFilter;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlockFilter;
import com.faceattend_edu.scheduling_service.infrastructure.persistence.adapter.ClassSessionPersistenceAdapter;
import com.faceattend_edu.scheduling_service.infrastructure.persistence.adapter.ScheduleBlockPersistenceAdapter;
import com.faceattend_edu.scheduling_service.infrastructure.persistence.entity.ClassSessionJpaEntity;
import com.faceattend_edu.scheduling_service.infrastructure.persistence.entity.EnvironmentJpaEntity;
import com.faceattend_edu.scheduling_service.infrastructure.persistence.entity.ScheduleBlockJpaEntity;
import com.faceattend_edu.scheduling_service.infrastructure.persistence.mapper.ClassSessionPersistenceMapper;
import com.faceattend_edu.scheduling_service.infrastructure.persistence.mapper.ScheduleBlockPersistenceMapper;
import com.faceattend_edu.scheduling_service.infrastructure.persistence.repository.ClassSessionJpaRepository;
import com.faceattend_edu.scheduling_service.infrastructure.persistence.repository.EnvironmentJpaRepository;
import com.faceattend_edu.scheduling_service.infrastructure.persistence.repository.ScheduleBlockJpaRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The listings filter in SQL (no full-table load, no per-row lookups): every filter, the school
 * traced block -> environment, and soft-deleted rows left out, including a session whose block is
 * gone (AUD-35). Class sessions are soft-deleted like every other table (AGENTS.md 2.2).
 */
@DataJpaTest(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.hbm2ddl.create_namespaces=true"
})
@Import({ClassSessionPersistenceAdapter.class, ClassSessionPersistenceMapper.class,
        ScheduleBlockPersistenceAdapter.class, ScheduleBlockPersistenceMapper.class})
@DisplayName("Scheduling search queries and class_session soft delete (H2)")
class SchedulingSearchPersistenceTest {

    @Autowired private ClassSessionPersistenceAdapter sessions;
    @Autowired private ScheduleBlockPersistenceAdapter blocks;
    @Autowired private ClassSessionJpaRepository sessionJpa;
    @Autowired private ScheduleBlockJpaRepository blockJpa;
    @Autowired private EnvironmentJpaRepository environmentJpa;
    @Autowired private EntityManager em;

    private int roomOfSchool1;
    private int roomOfSchool2;
    private long blockInSchool1;
    private long blockInSchool2;

    private int environment(int school, String code) {
        EnvironmentJpaEntity e = new EnvironmentJpaEntity();
        e.setSchoolId(school);
        e.setCode(code);
        e.setName(code);
        e.setCapacity((short) 30);
        e.setStatus(true);
        e.setCreatedAt(Instant.now());
        return environmentJpa.saveAndFlush(e).getEnvironmentId();
    }

    private long block(int room, long cohort, long instructor, int course) {
        ScheduleBlockJpaEntity b = new ScheduleBlockJpaEntity();
        b.setCohortId(cohort);
        b.setCourseId(course);
        b.setEnvironmentId(room);
        b.setInstructorActorId(instructor);
        b.setDayOfWeek((short) 1);
        b.setStartsAt(LocalTime.of(7, 0));
        b.setEndsAt(LocalTime.of(9, 0));
        b.setCreatedAt(Instant.now());
        return blockJpa.saveAndFlush(b).getScheduleBlockId();
    }

    private long session(long block, LocalDate date, String status) {
        ClassSessionJpaEntity s = new ClassSessionJpaEntity();
        s.setScheduleBlockId(block);
        s.setSessionDate(date);
        s.setSessionStatus(status);
        s.setCreatedAt(Instant.now());
        return sessionJpa.saveAndFlush(s).getClassSessionId();
    }

    @BeforeEach
    void setUp() {
        roomOfSchool1 = environment(1, "A-1");
        roomOfSchool2 = environment(2, "B-1");
        blockInSchool1 = block(roomOfSchool1, 100L, 7L, 3);
        blockInSchool2 = block(roomOfSchool2, 200L, 8L, 4);
    }

    private static List<Long> blockIds(List<ScheduleBlock> found) {
        return found.stream().map(ScheduleBlock::getScheduleBlockId).toList();
    }

    private static List<Long> sessionIds(List<ClassSession> found) {
        return found.stream().map(ClassSession::getClassSessionId).toList();
    }

    @Test
    void blocksAreFilteredByEachCriterionAndBySchool() {
        assertThat(blockIds(blocks.search(ScheduleBlockFilter.NONE, null))).containsExactly(blockInSchool1, blockInSchool2);
        assertThat(blockIds(blocks.search(ScheduleBlockFilter.byCohort(200L), null))).containsExactly(blockInSchool2);
        assertThat(blockIds(blocks.search(ScheduleBlockFilter.byInstructor(7L), null))).containsExactly(blockInSchool1);
        assertThat(blockIds(blocks.search(ScheduleBlockFilter.byEnvironment(roomOfSchool2), null))).containsExactly(blockInSchool2);
        assertThat(blockIds(blocks.search(new ScheduleBlockFilter(null, null, null, 3), null))).containsExactly(blockInSchool1);

        assertThat(blockIds(blocks.search(ScheduleBlockFilter.NONE, 1))).containsExactly(blockInSchool1);
        assertThat(blockIds(blocks.search(ScheduleBlockFilter.byCohort(200L), 1))).isEmpty();
    }

    @Test
    void sessionsAreFilteredByBlockDatesStatusAndSchool() {
        long early = session(blockInSchool1, LocalDate.of(2026, 3, 1), "Closed");
        long inside = session(blockInSchool1, LocalDate.of(2026, 3, 3), "Closed");
        long insideOpen = session(blockInSchool1, LocalDate.of(2026, 3, 4), "Open");
        long otherSchool = session(blockInSchool2, LocalDate.of(2026, 3, 3), "Closed");

        ClassSessionFilter range = new ClassSessionFilter(null, LocalDate.of(2026, 3, 2), LocalDate.of(2026, 3, 8), "Closed");
        assertThat(sessionIds(sessions.search(range, null))).containsExactly(inside, otherSchool);
        assertThat(sessionIds(sessions.search(range, 1))).containsExactly(inside);
        assertThat(sessionIds(sessions.search(new ClassSessionFilter(blockInSchool1, null, null, null), null)))
                .containsExactly(early, inside, insideOpen);
        assertThat(sessionIds(sessions.search(ClassSessionFilter.NONE, 2))).containsExactly(otherSchool);
    }

    @Test
    void aSessionWhoseBlockIsSoftDeletedHasNoSchoolAndDropsOutOfScopedListings() {
        long orphan = session(blockInSchool1, LocalDate.of(2026, 3, 3), "Open");
        blockJpa.deleteById(blockInSchool1);
        blockJpa.flush();
        em.clear();

        assertThat(sessionIds(sessions.search(ClassSessionFilter.NONE, 1))).isEmpty();
        assertThat(sessionIds(sessions.search(ClassSessionFilter.NONE, null))).containsExactly(orphan);
        assertThat(blockIds(blocks.search(ScheduleBlockFilter.NONE, 1))).isEmpty();
    }

    @Test
    void deletingASessionKeepsTheRowMarkedDeletedAndHidesIt() {
        long id = session(blockInSchool1, LocalDate.of(2026, 3, 3), "Open");
        long versionBefore = sessionJpa.findById(id).orElseThrow().getRowVersion();

        sessions.deleteById(id);
        sessionJpa.flush();
        em.clear();

        Object[] row = (Object[]) em.createNativeQuery(
                        "select \"deleted_at\", \"row_version\" from {h-schema}\"class_session\" where \"class_session_id\" = ?1")
                .setParameter(1, id)
                .getSingleResult();
        assertThat(row[0]).as("deleted_at").isNotNull();
        assertThat(((Number) row[1]).longValue()).isGreaterThan(versionBefore);
        assertThat(sessions.findById(id)).isEmpty();
        assertThat(sessions.search(ClassSessionFilter.NONE, null)).isEmpty();
    }
}
