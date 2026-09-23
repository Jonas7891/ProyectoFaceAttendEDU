package com.faceattend_edu.scheduling_service.domain.port.out;

import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock;
import java.util.List;
import java.util.Optional;

public interface ScheduleBlockRepository {
    ScheduleBlock save(ScheduleBlock block);
    Optional<ScheduleBlock> findById(Long id);
    List<ScheduleBlock> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
}
