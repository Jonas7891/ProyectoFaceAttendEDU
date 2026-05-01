package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.View;

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