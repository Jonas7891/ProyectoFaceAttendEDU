package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.infrastructure.persistence.entity.RoleModuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleModuleJpaRepository extends JpaRepository<RoleModuleEntity, Integer> {
}
