package com.faceattend_edu.attendance.domain.dto.patch;

import com.faceattend_edu.util.enums.ApprovalStatus;

public record JustificationPatch(
        Long attendanceId,

        String text,

        ApprovalStatus approval

        // Integer reviewedBy,

        //Instant reviewedAt
) {
}
