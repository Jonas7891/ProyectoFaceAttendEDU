package com.faceattend_edu.newModule.domain.dto.patch;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record RolePatch(
        List<Integer> moduleIds,

        String name,

        String description
) {
}
