package com.faceattend_edu.domain.dto.request;

import com.faceattend_edu.domain.model.Classroom;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record IotDeviceRequest(
        @NotNull(message = "El aula es requerida")
        Classroom classroom,

        @NotBlank(message = "El nombre del dispositivo es requerido")
        @Size(min = 1, max = 100, message = "El nombre debe tener entre 1 y 100 caracteres")
        String deviceName,

        @NotBlank(message = "La dirección MAC es requerida")
        @Pattern(regexp = "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$", message = "La dirección MAC debe ser válida (ej: AA:BB:CC:DD:EE:FF)")
        String macAddress,

        @NotBlank(message = "La dirección IP es requerida")
        @Pattern(regexp = "^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$", message = "La dirección IP debe ser válida")
        String ipAddress,

        @NotNull(message = "El estado es requerido")
        Object status,

        Instant lastConnection,

        @Size(max = 500, message = "La observación debe tener máximo 500 caracteres")
        String observation
) {
}