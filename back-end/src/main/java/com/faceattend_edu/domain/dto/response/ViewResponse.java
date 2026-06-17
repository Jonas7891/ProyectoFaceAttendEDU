package com.faceattend_edu.domain.dto.response;

import java.util.List;

public record ViewResponse(
        Integer id,
        String name,
        String route,
        String title,
        Boolean isPublic,
        List<ActionResponse> actions
) {
}