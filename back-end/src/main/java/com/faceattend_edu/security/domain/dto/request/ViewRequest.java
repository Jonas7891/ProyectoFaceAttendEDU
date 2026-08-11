package com.faceattend_edu.security.domain.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record ViewRequest(
        List<Integer> actionIds,

        @NotBlank(message = "El nombre es obligatorio")
        String name,

        @NotBlank(message = "La ruta es obligatoria")
        String route,

        @NotBlank(message = "El título es obligatorio")
        String title,

        boolean isPublic
) {
}