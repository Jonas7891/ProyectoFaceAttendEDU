package com.faceattend_edu.attendance.infrastructure.persistence.repository;

import com.faceattend_edu.attendance.infrastructure.persistence.entity.JustificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JustificationJpaRepository extends JpaRepository<JustificationEntity, Long> {
}
