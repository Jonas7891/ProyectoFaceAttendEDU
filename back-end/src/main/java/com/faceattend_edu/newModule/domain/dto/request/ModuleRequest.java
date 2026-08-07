package com.faceattend_edu.newModule.domain.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ModuleRequest(
        List<Integer> viewIds,

        @NotBlank(message = "El nombre es obligatorio")
        String name,

        String description,

        String icon,

        Integer order
) {
}