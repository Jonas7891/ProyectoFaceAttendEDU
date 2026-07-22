package com.faceattend_edu.newModule.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public record FacialEmbeddingRequest(
        @NotNull(message = "La persona es requerida")
        Integer personId,

        @NotEmpty(message = "El embedding no puede estar vacío")
        List<Float> embedding,

        @NotBlank(message = "La versión del modelo es requerida")
        @Size(min = 1, max = 100, message = "La versión debe tener entre 1 y 100 caracteres")
        String modelVersion,

        @NotNull(message = "El estado activo es requerido")
        Boolean isActive,

        @NotNull(message = "La fecha de creación es requerida")
        Instant createdAt
) {
}