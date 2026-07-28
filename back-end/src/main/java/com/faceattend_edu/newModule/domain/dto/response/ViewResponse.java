package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Action;

import java.time.LocalDateTime;
import java.util.List;

public record ViewResponse(
        Integer id,
        List<ActionResponse> actions,
        String name,
        String route,
        String title,
        boolean isPublic,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}