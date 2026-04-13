package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.Schedule;

import java.util.List;
import java.util.Optional;

public interface ScheduleRepositoryPort {
    Schedule save(Schedule schedule);

    Optional<Schedule> findById(Integer id);

    List<Schedule> findAll();

    void deleteById(Integer id);
}
