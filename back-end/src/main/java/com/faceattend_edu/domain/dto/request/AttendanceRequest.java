package com.faceattend_edu.domain.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record AttendanceRequest(
        @NotNull(message = "El estudiante es requerido")
        Integer studentId,

        @NotNull(message = "El horario es requerido")
        Integer scheduleId,

        @NotNull(message = "El dispositivo IoT es requerido")
        Integer iotDeviceId,

        @NotNull(message = "La fecha es requerida")
        LocalDate date,

        @NotNull(message = "La hora es requerida")
        LocalTime time,

        @NotNull(message = "El estado es requerido")
        Object status
) {
}