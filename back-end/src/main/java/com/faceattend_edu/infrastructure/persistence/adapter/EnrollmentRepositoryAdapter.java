package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.Enrollment;
import com.faceattend_edu.domain.port.EnrollmentRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.EnrollmentEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.EnrollmentRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.EnrollmentJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class EnrollmentRepositoryAdapter implements EnrollmentRepositoryPort {

    private final EnrollmentJpaRepository jpaRepository;
    private final EnrollmentRepositoryMapper mapper;

    @Override
    public Enrollment save(Enrollment enrollment) {
        EnrollmentEntity entity = mapper.toEntity(enrollment);
        EnrollmentEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Enrollment> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Enrollment> findAll() {
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
