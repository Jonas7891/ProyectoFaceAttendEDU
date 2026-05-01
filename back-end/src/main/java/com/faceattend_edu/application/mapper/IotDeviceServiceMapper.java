package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.IotDeviceRequest;
import com.faceattend_edu.domain.dto.response.IotDeviceResponse;
import com.faceattend_edu.domain.model.Classroom;
import com.faceattend_edu.domain.model.IotDevice;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class IotDeviceServiceMapper {

    private final ClassroomServiceMapper classroomServiceMapper;

    public IotDevice toDomain(IotDeviceRequest request,
                              Classroom classroom) {
        return new IotDevice(
                null,
                classroom,
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
                classroomServiceMapper.toResponse(iotDevice.getClassroom()),
                iotDevice.getDeviceName(),
                iotDevice.getMacAddress(),
                iotDevice.getIpAddress(),
                iotDevice.getStatus(),
                iotDevice.getLastConnection(),
                iotDevice.getObservation()
        );
    }
}
