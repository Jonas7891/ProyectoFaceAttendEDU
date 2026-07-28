package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Classroom;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record IotDeviceResponse(

        UUID id,

        @JsonView(Views.Public.class)
        ClassroomResponse classroom,

        @JsonView(Views.Public.class)
        String name,

        @JsonView(Views.Public.class)
        String macAddress,

        @JsonView(Views.Public.class)
        String ipAddress,

        // private DeviceStatus status; Sobreescritura (Override)

        @JsonView(Views.Public.class)
        LocalDateTime lastConnection,

        @JsonView(Views.Public.class)
        String observation,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}