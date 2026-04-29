package com.faceattend_edu.domain.dto.request;

import com.faceattend_edu.domain.model.Classroom;
import com.faceattend_edu.domain.model.Course;
import com.faceattend_edu.domain.model.Period;
import com.faceattend_edu.domain.model.Person;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record ScheduleRequest(
        @NotNull(message = "El período es requerido")
        Period period,

        @NotNull(message = "El curso es requerido")
        Course course,

        @NotNull(message = "El profesor es requerido")
        Person teacher,

        @NotNull(message = "El aula es requerida")
        Classroom classroom,

        @NotNull(message = "El día es requerido")
        Object day,

        @NotNull(message = "La hora de inicio es requerida")
        LocalTime startTime,

        @NotNull(message = "La hora de fin es requerida")
        LocalTime endTime
) {
}