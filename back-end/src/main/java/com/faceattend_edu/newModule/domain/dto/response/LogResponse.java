package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Attendance;
import com.faceattend_edu.util.Views;
import com.faceattend_edu.util.enums.ApprovalStatus;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.Instant;
import java.time.LocalDateTime;

public record LogResponse(

        Long id,

        @JsonView(Views.Public.class)
        UserResponse user,

        @JsonView(Views.Public.class)
        String action,

        @JsonView(Views.Public.class)
        String tableName,

        @JsonView(Views.Public.class)
        String affectedRecord,

        @JsonView(Views.Public.class)
        String description,

        @JsonView(Views.Public.class)
        LocalDateTime date,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}