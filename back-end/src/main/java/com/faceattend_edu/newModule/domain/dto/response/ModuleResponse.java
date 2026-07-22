package com.faceattend_edu.newModule.domain.dto.response;

import java.util.List;

public record ModuleResponse(
        Integer id,
        String name,
        String description,
        String icon,
        Integer order,
        List<ViewResponse> views
) {
}