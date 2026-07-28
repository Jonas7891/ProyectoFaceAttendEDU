package com.faceattend_edu.newModule.infrastructure.persistence.repository;

import com.faceattend_edu.newModule.infrastructure.persistence.entity.PersonEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PersonJpaRepository extends JpaRepository<PersonEntity, UUID> {
}
