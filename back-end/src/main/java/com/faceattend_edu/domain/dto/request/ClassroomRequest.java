package com.faceattend_edu.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ClassroomRequest(
        @NotNull(message = "La escuela es requerida")
        Integer schoolId,

        @NotBlank(message = "El nombre del aula es requerido")
        @Size(min = 1, max = 100, message = "El nombre debe tener entre 1 y 100 caracteres")
        String classroomName
) {
}