package com.faceattend_edu.academic.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record PeriodRequest(
        @NotNull(message = "La institución es obligatoria")
        UUID schoolId,

        @NotBlank(message = "El nombre es obligatorio")
        String name,

        @NotNull(message = "La fecha inicial es obligatoria")
        LocalDate startDate,

        @NotNull(message = "La fecha final es obligatoria")
        LocalDate endDate
) {
}