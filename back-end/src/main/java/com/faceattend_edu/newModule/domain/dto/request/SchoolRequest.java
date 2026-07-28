package com.faceattend_edu.newModule.domain.dto.request;

import jakarta.validation.constraints.*;

import java.time.Instant;

public record SchoolRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String name,

        @NotBlank(message = "El NIT es obligatorio")
        @Size(max = 50, message = "El NIT no puede superar los 50 caracteres")
        String nit,

        @Size(max = 500, message = "La dirección no puede superar los 500 caracteres")
        String address,

        @Pattern(
                regexp = "^[0-9]{7,15}$",
                message = "El teléfono debe contener entre 7 y 15 dígitos"
        )
        String phone,

        @Email(message = "El correo no es válido")
        String email
) {
}