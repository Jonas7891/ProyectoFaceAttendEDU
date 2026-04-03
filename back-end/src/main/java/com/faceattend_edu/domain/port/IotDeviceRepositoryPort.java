package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.IotDevice;

import java.util.List;
import java.util.Optional;

public interface IotDeviceRepositoryPort {
    IotDevice save(IotDevice iotDevice);

    Optional<IotDevice> findById(Integer id);

    List<IotDevice> findAll();

    void deleteById(Integer id);
}
