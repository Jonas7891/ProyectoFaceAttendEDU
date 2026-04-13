package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.infrastructure.persistence.entity.ViewActionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ViewActionJpaRepository extends JpaRepository<ViewActionEntity, Integer> {
}
