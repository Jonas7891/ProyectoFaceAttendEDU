package com.faceattend_edu.newModule.domain.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record EnrollmentRequest(
        @NotNull(message = "El estudiante es obligatorio")
        UUID studentId,

        @NotNull(message = "El curso es obligatorio")
        Integer courseId,

        @NotNull(message = "El periodo es obligatorio")
        Integer periodId,

        @NotNull(message = "La fecha es obligatoria")
        LocalDateTime date
) {
}