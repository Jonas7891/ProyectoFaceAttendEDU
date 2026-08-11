package com.faceattend_edu.academic.infrastructure.persistence.repository;

import com.faceattend_edu.academic.infrastructure.persistence.entity.PeriodEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PeriodJpaRepository extends JpaRepository<PeriodEntity, Integer> {
}
