package com.faceattend_edu.newModule.domain.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record AttendanceRequest(
        @NotNull(message = "El estudiante es obligatorio")
        UUID studentId,

        @NotNull(message = "El horario es obligatorio")
        Long scheduleId,

        @NotNull(message = "El dispositivo es obligatorio")
        UUID deviceId,

        @NotNull(message = "La fecha es obligatoria")
        LocalDate date,

        @NotNull(message = "La hora es obligatoria")
        LocalTime time
) {
}