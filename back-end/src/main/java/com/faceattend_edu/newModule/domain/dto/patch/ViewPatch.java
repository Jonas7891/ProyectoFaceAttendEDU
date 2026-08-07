package com.faceattend_edu.newModule.domain.dto.patch;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ViewPatch(
        List<Integer> actionIds,

        String name,

        String route,

        String title,

        boolean isPublic
) {
}
