package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.User;

import java.time.Instant;

public record LogResponse(
        Integer id,
        User user,
        String action,
        String tableName,
        String affectedRecord,
        String description,
        Instant date
) {
}