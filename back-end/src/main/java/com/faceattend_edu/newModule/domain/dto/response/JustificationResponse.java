package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.util.Views;
import com.faceattend_edu.util.enums.ApprovalStatus;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.Instant;
import java.time.LocalDateTime;

public record JustificationResponse(

        Integer id,

        @JsonView(Views.Public.class)
        AttendanceResponse attendance,

        @JsonView(Views.Public.class)
        String text,

        @JsonView(Views.Public.class)
        ApprovalStatus approval,

        // private Person reviewedBy;

        // private LocalDateTime reviewedAt;

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}