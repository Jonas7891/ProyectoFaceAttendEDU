package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.Attendance;
import com.faceattend_edu.domain.model.User;

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