package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.Attendance;
import com.faceattend_edu.domain.model.User;

import java.time.Instant;

public record JustificationResponse(
        Integer id,
        Attendance idAttendance,
        String justification,
        Object approval,
        Instant createdAt,
        User reviewedBy,
        Instant reviewedAt
) {
}