package com.faceattend_edu.academic.infrastructure.persistence.adapter;

import com.faceattend_edu.academic.domain.model.Classroom;
import com.faceattend_edu.academic.domain.port.ClassroomRepositoryPort;
import com.faceattend_edu.academic.infrastructure.persistence.entity.ClassroomEntity;
import com.faceattend_edu.academic.infrastructure.persistence.mapper.ClassroomRepositoryMapper;
import com.faceattend_edu.academic.infrastructure.persistence.repository.ClassroomJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
@AllArgsConstructor
public class ClassroomRepositoryAdapter
        extends AbstractRepositoryAdapter<ClassroomEntity, Classroom, Integer>
        implements ClassroomRepositoryPort {

    private final ClassroomJpaRepository jpaRepository;
    private final ClassroomRepositoryMapper mapper;

    @Override
    protected JpaRepository<ClassroomEntity, Integer> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<Classroom, ClassroomEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<ClassroomEntity, Classroom> toDomainMapper() {
        return mapper::toDomain;
    }
}
