package com.faceattend_edu.configuration.infrastructure.persistence.repository;

import com.faceattend_edu.configuration.infrastructure.persistence.entity.FacialEmbeddingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FacialEmbeddingJpaRepository extends JpaRepository<FacialEmbeddingEntity, UUID> {
}
