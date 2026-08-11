package com.faceattend_edu.security.domain.dto.patch;

import java.util.List;

public record ModulePatch(
        List<Integer> viewIds,

        String name,

        String description,

        String icon,

        Integer order
) {
}
