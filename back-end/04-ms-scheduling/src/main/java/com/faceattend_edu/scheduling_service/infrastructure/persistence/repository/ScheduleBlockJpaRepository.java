package com.faceattend_edu.scheduling_service.infrastructure.persistence.repository;

import com.faceattend_edu.scheduling_service.infrastructure.persistence.entity.ScheduleBlockJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleBlockJpaRepository extends JpaRepository<ScheduleBlockJpaEntity, Long> {
}
