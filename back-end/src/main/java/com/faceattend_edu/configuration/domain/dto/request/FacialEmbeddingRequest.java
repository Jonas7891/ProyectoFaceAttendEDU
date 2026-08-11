package com.faceattend_edu.configuration.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record FacialEmbeddingRequest(
        @NotNull(message = "La persona es obligatoria")
        UUID personId,

        @NotBlank(message = "El embedding es obligatorio")
        String embedding,

        @NotBlank(message = "La versión del modelo es obligatoria")
        String modelVersion
) {
}