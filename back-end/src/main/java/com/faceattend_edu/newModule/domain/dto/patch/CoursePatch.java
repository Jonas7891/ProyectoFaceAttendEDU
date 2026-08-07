package com.faceattend_edu.newModule.domain.dto.patch;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CoursePatch(
        UUID schoolId,

        String name,

        @Size(max = 50, message = "El código no puede superar los 50 caracteres")
        String code
) {
}
