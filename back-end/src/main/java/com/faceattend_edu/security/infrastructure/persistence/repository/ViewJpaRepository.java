package com.faceattend_edu.security.infrastructure.persistence.repository;

import com.faceattend_edu.security.infrastructure.persistence.entity.ViewEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ViewJpaRepository extends JpaRepository<ViewEntity, Integer> {
}
