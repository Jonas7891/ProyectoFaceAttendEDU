package com.faceattend_edu.newModule.infrastructure.persistence.repository;

import com.faceattend_edu.newModule.infrastructure.persistence.entity.ActionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActionJpaRepository extends JpaRepository<ActionEntity, Integer> {
}
