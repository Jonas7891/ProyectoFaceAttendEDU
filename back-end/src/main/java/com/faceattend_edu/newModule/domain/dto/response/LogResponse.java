package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Attendance;
import com.faceattend_edu.util.Views;
import com.faceattend_edu.util.enums.ApprovalStatus;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.Instant;
import java.time.LocalDateTime;

public record LogResponse(

        @JsonView(Views.AuditLog.class)
        Long id,

        @JsonView({Views.Public.class, Views.AuditLog.class})
        UserResponse user,

        @JsonView({Views.Public.class, Views.AuditLog.class})
        String action,

        @JsonView({Views.Public.class, Views.AuditLog.class})
        String tableName,

        @JsonView({Views.Public.class, Views.AuditLog.class})
        String affectedRecord,

        @JsonView({Views.Public.class, Views.AuditLog.class})
        String description,

        @JsonView({Views.Public.class, Views.AuditLog.class})
        LocalDateTime date,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}