package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.util.enums.ApprovalStatus;

import java.time.Instant;
import java.time.LocalDateTime;

public record JustificationResponse(
        Integer id,
        AttendanceResponse attendance,
        String text,
        ApprovalStatus approval,
        // private Person reviewedBy;
        // private LocalDateTime reviewedAt;
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}