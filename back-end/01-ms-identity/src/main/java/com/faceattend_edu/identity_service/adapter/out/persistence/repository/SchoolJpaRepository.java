package com.faceattend_edu.identity_service.adapter.out.persistence.repository;

import com.faceattend_edu.identity_service.adapter.out.persistence.entity.SchoolJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SchoolJpaRepository extends JpaRepository<SchoolJpaEntity, UUID> {
}
