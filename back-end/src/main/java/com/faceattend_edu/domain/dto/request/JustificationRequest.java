package com.faceattend_edu.domain.dto.request;

import com.faceattend_edu.domain.model.Attendance;
import com.faceattend_edu.domain.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record JustificationRequest(
        @NotNull(message = "La asistencia es requerida")
        Attendance idAttendance,

        @NotBlank(message = "La justificación es requerida")
        @Size(min = 10, max = 1000, message = "La justificación debe tener entre 10 y 1000 caracteres")
        String justification,

        @NotNull(message = "La aprobación es requerida")
        Object approval,

        @NotNull(message = "La fecha de creación es requerida")
        Instant createdAt,

        User reviewedBy,

        Instant reviewedAt
) {
}