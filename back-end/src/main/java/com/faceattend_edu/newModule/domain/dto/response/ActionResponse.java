package com.faceattend_edu.newModule.domain.dto.response;

import java.time.LocalDateTime;

public record ActionResponse(
        Integer id,
        String name,
        String description,
        String httpMethod,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}