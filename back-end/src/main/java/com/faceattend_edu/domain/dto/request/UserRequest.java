package com.faceattend_edu.domain.dto.request;

import com.faceattend_edu.domain.model.Person;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record UserRequest(
        @NotNull(message = "La persona es requerida")
        Integer personId,

        @NotBlank(message = "El nombre de usuario es requerido")
        @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres")
        @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos")
        String username,

        @NotBlank(message = "La contraseña es requerida")
        @Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres")
        String password,

        @NotNull(message = "El estado es requerido")
        Boolean status,

        Instant createdAt,

        Instant updatedAt,

        Instant lastLogin
) {
}