package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.infrastructure.persistence.entity.ActionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActionJpaRepository extends JpaRepository<ActionEntity, Integer> {

    boolean existsByName(String name);
}
