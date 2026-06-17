package com.faceattend_edu.domain.dto.response;

import java.time.Instant;

public record LogResponse(
        Integer id,
        UserResponse user,
        String action,
        String tableName,
        String affectedRecord,
        String description,
        Instant date
) {
}