package com.faceattend_edu.security.infrastructure.persistence.repository;

import com.faceattend_edu.security.infrastructure.persistence.entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleJpaRepository extends JpaRepository<RoleEntity, Integer> {
}
