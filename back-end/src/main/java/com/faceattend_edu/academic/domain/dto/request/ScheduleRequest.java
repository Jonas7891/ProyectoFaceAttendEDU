package com.faceattend_edu.academic.domain.dto.request;

import com.faceattend_edu.util.enums.Days;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;
import java.util.UUID;

public record ScheduleRequest(
        @NotNull(message = "El periodo es obligatorio")
        Integer periodId,

        @NotNull(message = "El curso es obligatorio")
        Integer courseId,

        @NotNull(message = "El docente es obligatorio")
        UUID teacherId,

        @NotNull(message = "El salón es obligatorio")
        Integer classroomId,

        @NotNull(message = "El día es obligatorio")
        Days day,

        @NotNull(message = "La hora inicial es obligatoria")
        LocalTime startTime,

        @NotNull(message = "La hora final es obligatoria")
        LocalTime endTime
) {
}