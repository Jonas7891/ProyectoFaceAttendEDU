package com.faceattend_edu.newModule.domain.dto.request;

import com.faceattend_edu.util.enums.ApprovalStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record JustificationRequest(
        @NotNull(message = "La asistencia es obligatoria")
        Long attendanceId,

        @NotBlank(message = "La justificación es obligatoria")
        String text,

        @NotNull(message = "El estado de aprobación es obligatorio")
        ApprovalStatus approval

        // Integer reviewedBy,

        //Instant reviewedAt
) {
}