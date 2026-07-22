package com.faceattend_edu.newModule.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CourseRequest(
        @NotNull(message = "La escuela es requerida")
        Integer schoolId,

        @NotBlank(message = "El nombre del curso es requerido")
        @Size(min = 1, max = 100, message = "El nombre debe tener entre 1 y 100 caracteres")
        String courseName,

        @NotBlank(message = "El código del curso es requerido")
        @Size(min = 1, max = 50, message = "El código debe tener entre 1 y 50 caracteres")
        String courseCode
) {
}