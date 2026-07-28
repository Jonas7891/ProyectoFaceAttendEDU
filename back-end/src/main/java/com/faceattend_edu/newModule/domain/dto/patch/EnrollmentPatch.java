package com.faceattend_edu.newModule.domain.dto.patch;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record EnrollmentPatch(
        UUID studentId,

        Integer courseId,

        Integer periodId,

        LocalDateTime date
) {
}
