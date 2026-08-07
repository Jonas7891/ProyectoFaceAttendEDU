package com.faceattend_edu.newModule.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record RoleRequest(
        List<Integer> moduleIds,

        @NotBlank(message = "El nombre es obligatorio")
        String name,

        String description
) {
}