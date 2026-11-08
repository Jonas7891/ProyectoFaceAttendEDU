package com.faceattend_edu.scheduling_service.infrastructure.persistence.repository;

import com.faceattend_edu.scheduling_service.infrastructure.persistence.entity.ClassSessionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ClassSessionJpaRepository extends JpaRepository<ClassSessionJpaEntity, Long> {
    List<ClassSessionJpaEntity> findByScheduleBlockId(Long scheduleBlockId);

    /**
     * Filtered listing in SQL. Each filter is switched on by its flag and an unused filter's value
     * is a placeholder (same pattern as 05-attendance's search). The school is traced through
     * schedule_block -> environment, both intra-schema and both live (deleted_at IS NULL), so an
     * orphan session simply does not match a school (AUD-35).
     */
    @Query("""
            select s from ClassSessionJpaEntity s
             where (:byBlock = false or s.scheduleBlockId = :blockId)
               and (:byFrom = false or s.sessionDate >= :from)
               and (:byTo = false or s.sessionDate <= :to)
               and (:byStatus = false or s.sessionStatus = :status)
               and (:bySchool = false or exists (
                     select 1 from ScheduleBlockJpaEntity b, EnvironmentJpaEntity e
                      where b.scheduleBlockId = s.scheduleBlockId and b.deletedAt is null
                        and e.environmentId = b.environmentId and e.deletedAt is null
                        and e.schoolId = :schoolId))
             order by s.classSessionId
            """)
    List<ClassSessionJpaEntity> search(@Param("byBlock") boolean byBlock, @Param("blockId") long blockId,
                                       @Param("byFrom") boolean byFrom, @Param("from") LocalDate from,
                                       @Param("byTo") boolean byTo, @Param("to") LocalDate to,
                                       @Param("byStatus") boolean byStatus, @Param("status") String status,
                                       @Param("bySchool") boolean bySchool, @Param("schoolId") int schoolId);
}
