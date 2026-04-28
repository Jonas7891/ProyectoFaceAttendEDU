package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.Classroom;

import java.time.Instant;

public record IotDeviceResponse(
        Integer id,
        Classroom classroom,
        String deviceName,
        String macAddress,
        String ipAddress,
        Object status,
        Instant lastConnection,
        String observation
) {
}