package com.faceattend_edu.newModule.domain.dto.request;

import jakarta.validation.constraints.*;

import java.time.Instant;

public record SchoolRequest(
        @NotBlank(message = "El nombre es requerido")
        @Size(min = 1, max = 150, message = "El nombre debe tener entre 1 y 150 caracteres")
        String name,

        @NotBlank(message = "El NIT es requerido")
        String nit,

        @NotBlank(message = "La dirección es requerida")
        String address,

        @NotBlank(message = "El teléfono es requerido")
        @Pattern(regexp = "^[+]?[0-9]{10,}$", message = "El teléfono debe ser válido (mínimo 10 dígitos)")
        String phone,

        @NotBlank(message = "El email es requerido")
        @Email(message = "El email debe ser válido")
        String email
) {
}