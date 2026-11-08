package com.faceattend_edu.scheduling_service.domain.port.out;

import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.model.ClassSessionFilter;
import java.util.List;
import java.util.Optional;

public interface ClassSessionRepository {
    ClassSession save(ClassSession session);
    Optional<ClassSession> findById(Long id);
    List<ClassSession> findAll();
    List<ClassSession> findByScheduleBlockId(Long scheduleBlockId);

    /**
     * Sessions matching {@code filter}, ordered by id. With {@code schoolId}, only those whose live
     * schedule_block sits in a live environment of that school: an orphan session (block or
     * environment soft-deleted) has no school and is left out (AUD-35).
     */
    List<ClassSession> search(ClassSessionFilter filter, Integer schoolId);

    void deleteById(Long id);
    boolean existsById(Long id);
}
