package com.faceattend_edu.audit.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record LogRequest(
        UUID userId,

        @NotBlank(message = "La acción es obligatoria")
        String action,

        @NotBlank(message = "La tabla es obligatoria")
        String tableName,

        @NotBlank(message = "El registro afectado es obligatorio")
        String affectedRecord,

        @NotBlank(message = "La descripción es obligatoria")
        String description,

        @NotNull(message = "La fecha es obligatoria")
        LocalDateTime date
) {
}