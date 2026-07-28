package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Classroom;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record IotDeviceResponse(
        UUID id,
        ClassroomResponse classroom,
        String name,
        String macAddress,
        String ipAddress,
        // private DeviceStatus status; Sobreescritura (Override)
        LocalDateTime lastConnection,
        String observation,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}