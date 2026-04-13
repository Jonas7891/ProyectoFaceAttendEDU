package com.faceattend_edu.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RoleRequest(
        @NotBlank(message = "El nombre es requerido")
        @Size(min = 1, max = 100, message = "El nombre debe tener entre 1 y 100 caracteres")
        String name,

        @Size(max = 500, message = "La descripción debe tener máximo 500 caracteres")
        String description
) {
}