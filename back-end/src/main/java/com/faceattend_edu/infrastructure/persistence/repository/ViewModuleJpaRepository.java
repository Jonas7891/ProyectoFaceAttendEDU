package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.infrastructure.persistence.entity.ViewModuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ViewModuleJpaRepository extends JpaRepository<ViewModuleEntity, Integer> {
}
