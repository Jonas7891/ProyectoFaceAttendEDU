package com.faceattend_edu.newModule.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CourseRequest(
        @NotNull(message = "La institución es obligatoria")
        UUID schoolId,

        @NotBlank(message = "El nombre es obligatorio")
        String name,

        @NotBlank(message = "El código es obligatorio")
        @Size(max = 50, message = "El código no puede superar los 50 caracteres")
        String code
) {
}