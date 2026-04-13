package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.infrastructure.persistence.entity.FacialEmbeddingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacialEmbeddingJpaRepository extends JpaRepository<FacialEmbeddingEntity, Integer> {
}
