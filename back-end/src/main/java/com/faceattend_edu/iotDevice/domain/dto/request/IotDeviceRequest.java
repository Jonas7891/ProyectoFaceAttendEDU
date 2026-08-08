package com.faceattend_edu.iotDevice.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record IotDeviceRequest(
        @NotNull(message = "El salón es obligatorio")
        Integer classroomId,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 1, max = 100, message = "El nombre debe tener entre 1 y 100 caracteres")
        String name,

        @NotBlank(message = "La dirección MAC es obligatoria")
        @Pattern(regexp = "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$", message = "La dirección MAC debe ser válida (ej: AA:BB:CC:DD:EE:FF)")
        String macAddress,

        @NotBlank(message = "La dirección IP es obligatoria")
        @Pattern(regexp = "^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$", message = "La dirección IP debe ser válida")
        String ipAddress,

        LocalDateTime lastConnection,

        String observation
) {
}