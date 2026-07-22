package com.faceattend_edu.newModule.domain.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record ScheduleRequest(
        @NotNull(message = "El período es requerido")
        Integer periodId,

        @NotNull(message = "El curso es requerido")
        Integer courseId,

        @NotNull(message = "El profesor es requerido")
        Integer teacherId,

        @NotNull(message = "El aula es requerida")
        Integer classroomId,

        @NotNull(message = "El día es requerido")
        Object day,

        @NotNull(message = "La hora de inicio es requerida")
        LocalTime startTime,

        @NotNull(message = "La hora de fin es requerida")
        LocalTime endTime
) {
}