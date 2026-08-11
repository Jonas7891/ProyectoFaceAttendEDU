package com.faceattend_edu.audit.infrastructure.persistence.adapter;

import com.faceattend_edu.audit.domain.model.Log;
import com.faceattend_edu.audit.domain.port.LogRepositoryPort;
import com.faceattend_edu.audit.infrastructure.persistence.entity.LogEntity;
import com.faceattend_edu.audit.infrastructure.persistence.mapper.LogRepositoryMapper;
import com.faceattend_edu.audit.infrastructure.persistence.repository.LogJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
@AllArgsConstructor
public class LogRepositoryAdapter
        extends AbstractRepositoryAdapter<LogEntity, Log, Long>
        implements LogRepositoryPort {

    private final LogJpaRepository jpaRepository;
    private final LogRepositoryMapper mapper;

    @Override
    protected JpaRepository<LogEntity, Long> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<Log, LogEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<LogEntity, Log> toDomainMapper() {
        return mapper::toDomain;
    }
}
