package com.faceattend_edu.domain.dto.request;

import com.faceattend_edu.domain.model.School;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record PersonRequest(
        @NotNull(message = "La escuela es requerida")
        School school,

        @NotBlank(message = "El nombre es requerido")
        @Size(min = 1, max = 100, message = "El nombre debe tener entre 1 y 100 caracteres")
        String name,

        @NotBlank(message = "El apellido es requerido")
        @Size(min = 1, max = 100, message = "El apellido debe tener entre 1 y 100 caracteres")
        String lastName,

        @NotBlank(message = "El email es requerido")
        @Email(message = "El email debe ser válido")
        String email,

        @NotBlank(message = "El teléfono es requerido")
        @Pattern(regexp = "^[+]?[0-9]{10,}$", message = "El teléfono debe ser válido (mínimo 10 dígitos)")
        String phone,

        @NotNull(message = "El estado de estudiante es requerido")
        Boolean isStudent,

        @NotNull(message = "El estado de profesor es requerido")
        Boolean isTeacher,

        @NotNull(message = "El estado es requerido")
        Boolean status,

        Instant createdAt,

        Instant updatedAt
) {
}