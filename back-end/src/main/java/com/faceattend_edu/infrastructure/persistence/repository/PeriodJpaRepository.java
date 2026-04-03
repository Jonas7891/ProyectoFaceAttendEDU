package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.infrastructure.persistence.entity.PeriodEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PeriodJpaRepository extends JpaRepository<PeriodEntity, Integer> {

    boolean existsByName(String name);
}
