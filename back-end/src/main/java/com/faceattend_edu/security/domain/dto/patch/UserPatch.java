package com.faceattend_edu.security.domain.dto.patch;

import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UserPatch(
        UUID personId,

        Integer roleId,

        @Size(min = 4, max = 50, message = "El usuario debe tener entre 4 y 50 caracteres")
        String username,

        @Size(min = 8, message = "La contraseña debe tener mínimo 8 caracteres")
        String password
) {
}
