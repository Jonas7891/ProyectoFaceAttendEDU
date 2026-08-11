package com.faceattend_edu.security.domain.dto.patch;

import jakarta.validation.constraints.Size;

public record ActionPatch(
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
        String name,

        @Size(max = 255, message = "La descripción no puede superar los 255 caracteres")
        String description,

        String httpMethod
) {
}
