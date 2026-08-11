package com.faceattend_edu.iotDevice.domain.dto.response;

import com.faceattend_edu.academic.domain.dto.response.ClassroomResponse;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.LocalDateTime;
import java.util.UUID;

public record IotDeviceResponse(

        @JsonView({Views.AttendanceDetail.class, Views.PendingJustifications.class, Views.DeviceStatus.class})
        UUID id,

        @JsonView({Views.Public.class, Views.DeviceStatus.class})
        ClassroomResponse classroom,

        @JsonView({Views.Public.class, Views.AttendanceDetail.class, Views.PendingJustifications.class, Views.DeviceStatus.class})
        String name,

        @JsonView({Views.Public.class, Views.DeviceStatus.class})
        String macAddress,

        @JsonView({Views.Public.class, Views.DeviceStatus.class})
        String ipAddress,

        // private DeviceStatus status; Sobreescritura (Override)

        @JsonView({Views.Public.class, Views.DeviceStatus.class})
        LocalDateTime lastConnection,

        @JsonView({Views.Public.class, Views.DeviceStatus.class})
        String observation,

        @JsonView(Views.DeviceStatus.class)
        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}