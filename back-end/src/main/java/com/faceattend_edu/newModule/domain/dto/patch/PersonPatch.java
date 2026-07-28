package com.faceattend_edu.newModule.domain.dto.patch;

import jakarta.validation.constraints.*;

import java.util.UUID;

public record PersonPatch(
        UUID schoolId,

        String name,

        String lastName,

        @Email(message = "El correo no es válido")
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
