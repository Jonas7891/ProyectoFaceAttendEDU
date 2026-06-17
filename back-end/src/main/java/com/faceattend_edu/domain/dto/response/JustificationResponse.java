package com.faceattend_edu.domain.dto.response;

import java.time.Instant;

public record JustificationResponse(
        Integer id,
        AttendanceResponse attendance,
        String justification,
        Object approval,
        Instant createdAt,
        UserResponse reviewedBy,
        Instant reviewedAt
) {
}