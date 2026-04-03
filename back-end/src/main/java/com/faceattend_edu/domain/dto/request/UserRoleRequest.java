package com.faceattend_edu.domain.dto.request;

import com.faceattend_edu.domain.model.Role;
import com.faceattend_edu.domain.model.User;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record UserRoleRequest(
        @NotNull(message = "El usuario es requerido")
        User idUser,

        @NotNull(message = "El rol es requerido")
        Role idRole,

        @NotNull(message = "La fecha de asignación es requerida")
        Instant assignedDate,

        Instant expiryDate
) {
}