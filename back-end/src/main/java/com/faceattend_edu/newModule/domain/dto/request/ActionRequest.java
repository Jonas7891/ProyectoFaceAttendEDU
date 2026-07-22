package com.faceattend_edu.newModule.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ActionRequest(
        @NotBlank(message = "El nombre es requerido")
        @Size(min = 1, max = 100, message = "El nombre debe tener entre 1 y 100 caracteres")
        String name,

        @NotBlank(message = "La descripción es requerida")
        @Size(min = 1, max = 500, message = "La descripción debe tener máximo 500 caracteres")
        String description,

        @NotBlank(message = "El método HTTP es requerido")
        String httpMethod,

        @NotNull(message = "El estado es requerido")
        Boolean enabled
) {
}