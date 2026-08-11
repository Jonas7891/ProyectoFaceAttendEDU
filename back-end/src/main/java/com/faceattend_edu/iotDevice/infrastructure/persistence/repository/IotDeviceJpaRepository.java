package com.faceattend_edu.iotDevice.infrastructure.persistence.repository;

import com.faceattend_edu.iotDevice.infrastructure.persistence.entity.IotDeviceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface IotDeviceJpaRepository extends JpaRepository<IotDeviceEntity, UUID> {
}
