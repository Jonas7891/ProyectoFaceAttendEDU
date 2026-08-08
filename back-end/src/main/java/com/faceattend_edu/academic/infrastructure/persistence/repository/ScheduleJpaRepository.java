package com.faceattend_edu.academic.infrastructure.persistence.repository;

import com.faceattend_edu.academic.infrastructure.persistence.entity.ScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleJpaRepository extends JpaRepository<ScheduleEntity, Long> {
}
