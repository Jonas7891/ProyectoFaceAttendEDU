package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.infrastructure.persistence.entity.EnrollmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentJpaRepository extends JpaRepository<EnrollmentEntity, Integer> {
}
