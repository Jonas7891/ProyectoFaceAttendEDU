package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.infrastructure.persistence.entity.ViewEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ViewJpaRepository extends JpaRepository<ViewEntity, Integer> {

    boolean existsByName(String name);
}
