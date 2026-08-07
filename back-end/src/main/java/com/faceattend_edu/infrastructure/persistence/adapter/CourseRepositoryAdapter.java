package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.Course;
import com.faceattend_edu.domain.port.CourseRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.CourseEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.CourseRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.CourseJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class CourseRepositoryAdapter implements CourseRepositoryPort {

    private final CourseJpaRepository jpaRepository;
    private final CourseRepositoryMapper mapper;

    @Override
    public Course save(Course course) {
        CourseEntity entity = mapper.toEntity(course);
        CourseEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Course> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Course> findAll() {
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
