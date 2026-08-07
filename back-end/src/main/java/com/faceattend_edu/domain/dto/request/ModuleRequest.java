package com.faceattend_edu.domain.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ModuleRequest(
        @NotBlank(message = "El nombre es requerido")
        @Size(min = 1, max = 100, message = "El nombre debe tener entre 1 y 100 caracteres")
        String name,

        @Size(max = 500, message = "La descripción debe tener máximo 500 caracteres")
        String description,

        @Size(max = 50, message = "El icono debe tener máximo 50 caracteres")
        String icon,

        @NotNull(message = "El orden es requerido")
        @Min(value = 0, message = "El orden debe ser un número positivo")
        Integer order,

        @NotNull(message = "Los IDs de vistas son requeridos")
        List<Integer> viewIds
) {
}