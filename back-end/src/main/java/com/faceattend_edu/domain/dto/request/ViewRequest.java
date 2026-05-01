package com.faceattend_edu.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ViewRequest(
        @NotBlank(message = "El nombre es requerido")
        @Size(min = 1, max = 100, message = "El nombre debe tener entre 1 y 100 caracteres")
        String name,

        @NotBlank(message = "La ruta es requerida")
        @Size(min = 1, max = 200, message = "La ruta debe tener entre 1 y 200 caracteres")
        String route,

        @NotBlank(message = "El título es requerido")
        @Size(min = 1, max = 150, message = "El título debe tener entre 1 y 150 caracteres")
        String title,

        @NotNull(message = "El estado público es requerido")
        Boolean isPublic,

        @NotNull(message = "Los IDs de acciones son requeridos")
        List<Integer> actionIds
) {
}