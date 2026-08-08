package com.faceattend_edu.academic.domain.dto.patch;

import java.time.LocalDateTime;
import java.util.UUID;

public record EnrollmentPatch(
        UUID studentId,

        Integer courseId,

        Integer periodId,

        LocalDateTime date
) {
}
