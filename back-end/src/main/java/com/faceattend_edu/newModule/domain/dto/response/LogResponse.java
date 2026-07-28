package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Attendance;
import com.faceattend_edu.util.enums.ApprovalStatus;

import java.time.Instant;
import java.time.LocalDateTime;

public record LogResponse(
        Long id,
        UserResponse user,
        String action,
        String tableName,
        String affectedRecord,
        String description,
        LocalDateTime date,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}