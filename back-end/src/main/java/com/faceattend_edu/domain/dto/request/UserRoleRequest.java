package com.faceattend_edu.domain.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record UserRoleRequest(
        @NotNull(message = "El usuario es requerido")
        Integer userId,

        @NotNull(message = "El rol es requerido")
        Integer roleId,

        @NotNull(message = "La fecha de asignación es requerida")
        Instant assignedDate,

        Instant expiryDate
) {
}