package com.faceattend_edu.newModule.domain.dto.patch;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ModulePatch(
        List<Integer> viewIds,

        String name,

        String description,

        String icon,

        Integer order
) {
}
