package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.infrastructure.persistence.entity.IotDeviceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IotDeviceJpaRepository extends JpaRepository<IotDeviceEntity, Integer> {
}
