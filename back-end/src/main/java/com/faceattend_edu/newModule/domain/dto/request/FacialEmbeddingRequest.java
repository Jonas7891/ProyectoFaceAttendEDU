package com.faceattend_edu.newModule.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
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