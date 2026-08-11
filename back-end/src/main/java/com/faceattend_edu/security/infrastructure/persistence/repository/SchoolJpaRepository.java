package com.faceattend_edu.security.infrastructure.persistence.repository;

import com.faceattend_edu.security.infrastructure.persistence.entity.SchoolEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SchoolJpaRepository extends JpaRepository<SchoolEntity, UUID> {

    boolean existsByName(String name);
}
