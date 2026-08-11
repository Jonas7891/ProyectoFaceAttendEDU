package com.faceattend_edu.security.infrastructure.persistence.repository;

import com.faceattend_edu.security.infrastructure.persistence.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserJpaRepository extends JpaRepository<UserEntity, UUID> {
}
