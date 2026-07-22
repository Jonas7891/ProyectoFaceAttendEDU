package com.faceattend_edu.newModule.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record LogRequest(
        @NotNull(message = "El usuario es requerido")
        Integer userId,

        @NotBlank(message = "La acción es requerida")
        @Size(min = 1, max = 50, message = "La acción debe tener entre 1 y 50 caracteres")
        String action,

        @NotBlank(message = "El nombre de la tabla es requerido")
        @Size(min = 1, max = 100, message = "El nombre debe tener entre 1 y 100 caracteres")
        String tableName,

        @Size(max = 100, message = "El registro afectado debe tener máximo 100 caracteres")
        String affectedRecord,

        @Size(max = 500, message = "La descripción debe tener máximo 500 caracteres")
        String description,

        @NotNull(message = "La fecha es requerida")
        Instant date
) {
    public Integer att() {
        return null;
    }
}