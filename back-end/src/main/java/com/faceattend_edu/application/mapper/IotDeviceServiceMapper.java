package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.IotDeviceRequest;
import com.faceattend_edu.domain.dto.response.IotDeviceResponse;
import com.faceattend_edu.domain.model.IotDevice;
import org.springframework.stereotype.Component;

@Component
public class IotDeviceServiceMapper {

    public IotDevice toDomain(IotDeviceRequest request) {
        return new IotDevice(
                null,
                request.classroom(),
                request.deviceName(),
                request.macAddress(),
                request.ipAddress(),
                request.status(),
                request.lastConnection(),
                request.observation()
        );
    }

    public IotDeviceResponse toResponse(IotDevice iotDevice) {
        return new IotDeviceResponse(
                iotDevice.getId(),
                iotDevice.getClassroom(),
                iotDevice.getDeviceName(),
                iotDevice.getMacAddress(),
                iotDevice.getIpAddress(),
                iotDevice.getStatus(),
                iotDevice.getLastConnection(),
                iotDevice.getObservation()
        );
    }
}
