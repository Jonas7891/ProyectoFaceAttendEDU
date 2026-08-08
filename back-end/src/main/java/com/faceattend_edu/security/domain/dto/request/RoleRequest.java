package com.faceattend_edu.security.domain.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record RoleRequest(
        List<Integer> moduleIds,

        @NotBlank(message = "El nombre es obligatorio")
        String name,

        String description
) {
}