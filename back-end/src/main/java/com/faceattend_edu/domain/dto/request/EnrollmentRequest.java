package com.faceattend_edu.domain.dto.request;

import com.faceattend_edu.domain.model.Course;
import com.faceattend_edu.domain.model.Period;
import com.faceattend_edu.domain.model.Person;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record EnrollmentRequest(
        @NotNull(message = "El estudiante es requerido")
        Person idStudent,

        @NotNull(message = "El curso es requerido")
        Course idCourse,

        @NotNull(message = "El período es requerido")
        Period idPeriod,

        @NotNull(message = "La fecha de matrícula es requerida")
        Instant enrollmentDate,

        @NotNull(message = "El estado es requerido")
        Object status
) {
}