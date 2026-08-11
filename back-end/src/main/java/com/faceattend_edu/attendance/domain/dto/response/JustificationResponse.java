package com.faceattend_edu.attendance.domain.dto.response;

import com.faceattend_edu.util.Views;
import com.faceattend_edu.util.enums.ApprovalStatus;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.LocalDateTime;

public record JustificationResponse(

        @JsonView(Views.PendingJustifications.class)
        Integer id,

        @JsonView({Views.Public.class, Views.PendingJustifications.class})
        AttendanceResponse attendance,

        @JsonView({Views.Public.class, Views.PendingJustifications.class})
        String text,

        @JsonView(Views.Public.class)
        ApprovalStatus approval,

        // private Person reviewedBy;

        // private LocalDateTime reviewedAt;

        boolean status,

        @JsonView(Views.PendingJustifications.class)
        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}