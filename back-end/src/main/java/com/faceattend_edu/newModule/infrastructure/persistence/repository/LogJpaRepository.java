package com.faceattend_edu.newModule.infrastructure.persistence.repository;

import com.faceattend_edu.newModule.infrastructure.persistence.entity.LogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogJpaRepository extends JpaRepository<LogEntity, Long> {
}
