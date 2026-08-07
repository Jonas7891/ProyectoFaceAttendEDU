package com.faceattend_edu.newModule.domain.dto.request;

import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.UUID;

public record PersonRequest(
        @NotNull(message = "La institución es obligatoria")
        UUID schoolId,

        @NotBlank(message = "El nombre es obligatorio")
        String name,

        @NotBlank(message = "El apellido es obligatorio")
        String lastName,

        @Email(message = "El correo no es válido")
        @NotBlank(message = "El correo es obligatorio")
        String email,

        @Pattern(
                regexp = "^[0-9]{7,15}$",
                message = "El teléfono debe contener entre 7 y 15 dígitos"
        )
        String phone,

        boolean isStudent,

        boolean isTeacher
) {
}