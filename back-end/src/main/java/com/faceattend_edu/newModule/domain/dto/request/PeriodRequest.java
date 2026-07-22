package com.faceattend_edu.newModule.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record PeriodRequest(
        @NotNull(message = "La escuela es requerida")
        Integer schoolId,

        @NotBlank(message = "El nombre es requerido")
        @Size(min = 1, max = 100, message = "El nombre debe tener entre 1 y 100 caracteres")
        String name,

        @NotNull(message = "La fecha de inicio es requerida")
        LocalDate startDate,

        @NotNull(message = "La fecha de fin es requerida")
        LocalDate endDate,

        @NotNull(message = "El estado activo es requerido")
        Boolean isActive
) {
}