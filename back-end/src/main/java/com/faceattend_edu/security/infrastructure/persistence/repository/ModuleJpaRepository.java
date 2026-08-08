package com.faceattend_edu.security.infrastructure.persistence.repository;

import com.faceattend_edu.security.infrastructure.persistence.entity.ModuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModuleJpaRepository extends JpaRepository<ModuleEntity, Integer> {
}
