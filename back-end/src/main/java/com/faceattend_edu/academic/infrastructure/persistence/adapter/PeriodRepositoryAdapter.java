package com.faceattend_edu.academic.infrastructure.persistence.adapter;

import com.faceattend_edu.academic.domain.model.Period;
import com.faceattend_edu.academic.domain.port.PeriodRepositoryPort;
import com.faceattend_edu.academic.infrastructure.persistence.entity.PeriodEntity;
import com.faceattend_edu.academic.infrastructure.persistence.mapper.PeriodRepositoryMapper;
import com.faceattend_edu.academic.infrastructure.persistence.repository.PeriodJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
@AllArgsConstructor
public class PeriodRepositoryAdapter
        extends AbstractRepositoryAdapter<PeriodEntity, Period, Integer>
        implements PeriodRepositoryPort {

    private final PeriodJpaRepository jpaRepository;
    private final PeriodRepositoryMapper mapper;

    @Override
    protected JpaRepository<PeriodEntity, Integer> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<Period, PeriodEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<PeriodEntity, Period> toDomainMapper() {
        return mapper::toDomain;
    }
}
