package com.faceattend_edu.academic.infrastructure.persistence.adapter;

import com.faceattend_edu.academic.domain.model.Enrollment;
import com.faceattend_edu.academic.domain.port.EnrollmentRepositoryPort;
import com.faceattend_edu.academic.infrastructure.persistence.entity.EnrollmentEntity;
import com.faceattend_edu.academic.infrastructure.persistence.mapper.EnrollmentRepositoryMapper;
import com.faceattend_edu.academic.infrastructure.persistence.repository.EnrollmentJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
@AllArgsConstructor
public class EnrollmentRepositoryAdapter
        extends AbstractRepositoryAdapter<EnrollmentEntity, Enrollment, Long>
        implements EnrollmentRepositoryPort {

    private final EnrollmentJpaRepository jpaRepository;
    private final EnrollmentRepositoryMapper mapper;

    @Override
    protected JpaRepository<EnrollmentEntity, Long> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<Enrollment, EnrollmentEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<EnrollmentEntity, Enrollment> toDomainMapper() {
        return mapper::toDomain;
    }
}
