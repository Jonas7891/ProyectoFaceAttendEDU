package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.View;

import java.time.LocalDateTime;
import java.util.List;

public record ModuleResponse(
        Integer id,
        List<ViewResponse> views,
        String name,
        String description,
        String icon,
        Integer order,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}