package com.faceattend_edu.newModule.infrastructure.persistence.adapter;

import com.faceattend_edu.newModule.domain.model.Course;
import com.faceattend_edu.newModule.domain.port.CourseRepositoryPort;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.CourseEntity;
import com.faceattend_edu.newModule.infrastructure.persistence.mapper.CourseRepositoryMapper;
import com.faceattend_edu.newModule.infrastructure.persistence.repository.CourseJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
@AllArgsConstructor
public class CourseRepositoryAdapter
        extends AbstractRepositoryAdapter<CourseEntity, Course, Integer>
        implements CourseRepositoryPort {

    private final CourseJpaRepository jpaRepository;
    private final CourseRepositoryMapper mapper;

    @Override
    protected JpaRepository<CourseEntity, Integer> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<Course, CourseEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<CourseEntity, Course> toDomainMapper() {
        return mapper::toDomain;
    }
}
