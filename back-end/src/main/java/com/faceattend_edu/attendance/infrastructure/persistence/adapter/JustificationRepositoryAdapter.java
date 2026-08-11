package com.faceattend_edu.attendance.infrastructure.persistence.adapter;

import com.faceattend_edu.attendance.domain.model.Justification;
import com.faceattend_edu.attendance.domain.port.JustificationRepositoryPort;
import com.faceattend_edu.attendance.infrastructure.persistence.entity.JustificationEntity;
import com.faceattend_edu.attendance.infrastructure.persistence.mapper.JustificationRepositoryMapper;
import com.faceattend_edu.attendance.infrastructure.persistence.repository.JustificationJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
@AllArgsConstructor
public class JustificationRepositoryAdapter
        extends AbstractRepositoryAdapter<JustificationEntity, Justification, Long>
        implements JustificationRepositoryPort {

    private final JustificationJpaRepository jpaRepository;
    private final JustificationRepositoryMapper mapper;

    @Override
    protected JpaRepository<JustificationEntity, Long> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<Justification, JustificationEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<JustificationEntity, Justification> toDomainMapper() {
        return mapper::toDomain;
    }
}
