package com.faceattend_edu.security.infrastructure.persistence.adapter;

import com.faceattend_edu.security.domain.model.School;
import com.faceattend_edu.security.domain.port.SchoolRepositoryPort;
import com.faceattend_edu.security.infrastructure.persistence.entity.SchoolEntity;
import com.faceattend_edu.security.infrastructure.persistence.mapper.SchoolRepositoryMapper;
import com.faceattend_edu.security.infrastructure.persistence.repository.SchoolJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.function.Function;

@Component
@AllArgsConstructor
public class SchoolRepositoryAdapter
        extends AbstractRepositoryAdapter<SchoolEntity, School, UUID>
        implements SchoolRepositoryPort {

    private final SchoolJpaRepository jpaRepository;
    private final SchoolRepositoryMapper mapper;

    @Override
    protected JpaRepository<SchoolEntity, UUID> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<School, SchoolEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<SchoolEntity, School> toDomainMapper() {
        return mapper::toDomain;
    }
}
