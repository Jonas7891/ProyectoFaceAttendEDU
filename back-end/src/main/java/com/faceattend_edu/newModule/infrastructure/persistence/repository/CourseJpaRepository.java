package com.faceattend_edu.newModule.infrastructure.persistence.repository;

import com.faceattend_edu.newModule.infrastructure.persistence.entity.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseJpaRepository extends JpaRepository<CourseEntity, Integer> {
}
