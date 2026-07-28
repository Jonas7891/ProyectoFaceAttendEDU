package com.faceattend_edu.newModule.domain.dto.patch;

import com.faceattend_edu.util.enums.ApprovalStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record JustificationPatch(
        Long attendanceId,

        String text,

        ApprovalStatus approval

        // Integer reviewedBy,

        //Instant reviewedAt
) {
}
