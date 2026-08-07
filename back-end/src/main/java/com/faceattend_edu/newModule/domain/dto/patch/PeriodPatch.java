package com.faceattend_edu.newModule.domain.dto.patch;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record PeriodPatch(
        UUID schoolId,

        String name,

        LocalDate startDate,

        LocalDate endDate
) {
}
