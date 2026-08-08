package com.faceattend_edu.security.domain.dto.patch;

import java.util.List;

public record RolePatch(
        List<Integer> moduleIds,

        String name,

        String description
) {
}
