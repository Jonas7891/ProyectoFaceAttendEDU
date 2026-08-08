package com.faceattend_edu.academic.domain.dto.patch;

import java.time.LocalDate;
import java.util.UUID;

public record PeriodPatch(
        UUID schoolId,

        String name,

        LocalDate startDate,

        LocalDate endDate
) {
}
