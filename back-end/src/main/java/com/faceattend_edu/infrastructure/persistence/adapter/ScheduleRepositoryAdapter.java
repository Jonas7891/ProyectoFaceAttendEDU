package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.Schedule;
import com.faceattend_edu.domain.port.ScheduleRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.*;
import com.faceattend_edu.infrastructure.persistence.mapper.ScheduleRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.ScheduleJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class ScheduleRepositoryAdapter implements ScheduleRepositoryPort {

    private final ScheduleJpaRepository jpaRepository;
    private final ScheduleRepositoryMapper mapper;

    @Override
    public Schedule save(Schedule schedule) {
        ScheduleEntity entity = mapper.toEntity(schedule);
        ScheduleEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Schedule> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Schedule> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

}
