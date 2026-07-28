package com.faceattend_edu.newModule.infrastructure.persistence.adapter;

import com.faceattend_edu.newModule.domain.model.Schedule;
import com.faceattend_edu.newModule.domain.port.ScheduleRepositoryPort;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.ScheduleEntity;
import com.faceattend_edu.newModule.infrastructure.persistence.mapper.ScheduleRepositoryMapper;
import com.faceattend_edu.newModule.infrastructure.persistence.repository.ScheduleJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
@AllArgsConstructor
public class ScheduleRepositoryAdapter
        extends AbstractRepositoryAdapter<ScheduleEntity, Schedule, Long>
        implements ScheduleRepositoryPort {

    private final ScheduleJpaRepository jpaRepository;
    private final ScheduleRepositoryMapper mapper;

    @Override
    protected JpaRepository<ScheduleEntity, Long> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<Schedule, ScheduleEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<ScheduleEntity, Schedule> toDomainMapper() {
        return mapper::toDomain;
    }
}
