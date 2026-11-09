package com.faceattend_edu.scheduling_service.infrastructure.persistence.repository;

import com.faceattend_edu.scheduling_service.infrastructure.persistence.entity.ScheduleBlockJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalTime;

public interface ScheduleBlockJpaRepository extends JpaRepository<ScheduleBlockJpaEntity, Long> {

    /**
     * Filtered listing in SQL; each filter is switched on by its flag and an unused filter's value is
     * a placeholder. The school comes from the block's live environment (intra-schema).
     */
    @Query("""
            select b from ScheduleBlockJpaEntity b
             where (:byCohort = false or b.cohortId = :cohortId)
               and (:byEnvironment = false or b.environmentId = :environmentId)
               and (:byInstructor = false or b.instructorActorId = :instructorActorId)
               and (:byCourse = false or b.courseId = :courseId)
               and (:bySchool = false or exists (
                     select 1 from EnvironmentJpaEntity e
                      where e.environmentId = b.environmentId and e.deletedAt is null and e.schoolId = :schoolId))
             order by b.scheduleBlockId
            """)
    java.util.List<ScheduleBlockJpaEntity> search(@Param("byCohort") boolean byCohort, @Param("cohortId") long cohortId,
                                                  @Param("byEnvironment") boolean byEnvironment, @Param("environmentId") int environmentId,
                                                  @Param("byInstructor") boolean byInstructor, @Param("instructorActorId") long instructorActorId,
                                                  @Param("byCourse") boolean byCourse, @Param("courseId") int courseId,
                                                  @Param("bySchool") boolean bySchool, @Param("schoolId") int schoolId);

    /** Soft-deleted blocks are filtered out by the entity's @SQLRestriction. */
    boolean existsByEnvironmentId(Integer environmentId);

    @Query("""
            select count(b) > 0 from ScheduleBlockJpaEntity b
            where b.deletedAt is null and b.environmentId = :environmentId and b.dayOfWeek = :dayOfWeek
              and b.startsAt < :endsAt and b.endsAt > :startsAt
              and (:excludeId is null or b.scheduleBlockId <> :excludeId)
            """)
    boolean existsEnvironmentOverlap(@Param("environmentId") Integer environmentId, @Param("dayOfWeek") Short dayOfWeek,
                                     @Param("startsAt") LocalTime startsAt, @Param("endsAt") LocalTime endsAt,
                                     @Param("excludeId") Long excludeId);

    @Query("""
            select count(b) > 0 from ScheduleBlockJpaEntity b
            where b.deletedAt is null and b.instructorActorId = :instructorActorId and b.dayOfWeek = :dayOfWeek
              and b.startsAt < :endsAt and b.endsAt > :startsAt
              and (:excludeId is null or b.scheduleBlockId <> :excludeId)
            """)
    boolean existsInstructorOverlap(@Param("instructorActorId") Long instructorActorId, @Param("dayOfWeek") Short dayOfWeek,
                                    @Param("startsAt") LocalTime startsAt, @Param("endsAt") LocalTime endsAt,
                                    @Param("excludeId") Long excludeId);
}
