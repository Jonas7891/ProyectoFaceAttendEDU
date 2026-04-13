package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.Course;
import com.faceattend_edu.domain.port.CourseRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.CourseEntity;
import com.faceattend_edu.infrastructure.persistence.entity.SchoolEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class CourseRepositoryAdapter implements CourseRepositoryPort {

    private final CourseJpaRepository jpaRepository;
    private final SchoolRepositoryAdapter schoolRepositoryAdapter;

    @Override
    public Course save(Course course) {
        CourseEntity entity = toEntity(course);
        CourseEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Course> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Course> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

    //

    private CourseEntity toEntity(Course course) {
        CourseEntity entity = new CourseEntity();
        entity.setId(course.getId());

        SchoolEntity school = new SchoolEntity();
        school.setId(course.getIdSchool().getId());
        entity.setIdSchool(school);

        entity.setCourseName(course.getCourseName());
        entity.setCourseCode(course.getCourseCode());
        return entity;
    }

    public Course toDomain(CourseEntity entity) {
        return new Course(
                entity.getId(),
                schoolRepositoryAdapter.toDomain(entity.getIdSchool()),
                entity.getCourseName(),
                entity.getCourseCode()
        );
    }
}
