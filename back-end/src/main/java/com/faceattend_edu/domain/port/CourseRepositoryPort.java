package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.Course;

import java.util.List;
import java.util.Optional;

public interface CourseRepositoryPort {
    Course save(Course course);

    Optional<Course> findById(Integer id);

    List<Course> findAll();

    void deleteById(Integer id);
}
