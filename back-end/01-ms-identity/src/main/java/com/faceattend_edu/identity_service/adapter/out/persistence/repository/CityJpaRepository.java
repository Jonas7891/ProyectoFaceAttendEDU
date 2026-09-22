package com.faceattend_edu.identity_service.adapter.out.persistence.repository;

import com.faceattend_edu.identity_service.adapter.out.persistence.entity.CityJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CityJpaRepository extends JpaRepository<CityJpaEntity, Integer> {
}
