package com.faceattend_edu.security.domain.dto.patch;

import java.util.List;

public record ViewPatch(
        List<Integer> actionIds,

        String name,

        String route,

        String title,

        boolean isPublic
) {
}
