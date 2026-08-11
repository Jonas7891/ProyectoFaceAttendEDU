package com.faceattend_edu.academic.infrastructure.persistence.repository;

import com.faceattend_edu.academic.infrastructure.persistence.entity.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseJpaRepository extends JpaRepository<CourseEntity, Integer> {
}
