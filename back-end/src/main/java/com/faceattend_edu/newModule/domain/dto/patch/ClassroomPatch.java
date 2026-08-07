package com.faceattend_edu.newModule.domain.dto.patch;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ClassroomPatch(
        UUID schoolId,

        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
        String name
) {
}
