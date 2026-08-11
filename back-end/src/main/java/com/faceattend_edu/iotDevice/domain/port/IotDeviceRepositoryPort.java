package com.faceattend_edu.iotDevice.domain.port;

import com.faceattend_edu.iotDevice.domain.model.IotDevice;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;

import java.util.UUID;

public interface IotDeviceRepositoryPort extends AbstractRepositoryPort<IotDevice, UUID> {
}
