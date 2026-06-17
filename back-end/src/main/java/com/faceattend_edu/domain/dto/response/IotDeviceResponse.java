package com.faceattend_edu.domain.dto.response;

import java.time.Instant;

public record IotDeviceResponse(
        Integer id,
        ClassroomResponse classroom,
        String deviceName,
        String macAddress,
        String ipAddress,
        Object status,
        Instant lastConnection,
        String observation
) {
}