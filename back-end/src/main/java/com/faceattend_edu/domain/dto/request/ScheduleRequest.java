package com.faceattend_edu.domain.dto.request;

import com.faceattend_edu.domain.model.Classroom;
import com.faceattend_edu.domain.model.Course;
import com.faceattend_edu.domain.model.Period;
import com.faceattend_edu.domain.model.Person;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record ScheduleRequest(
        @NotNull(message = "El período es requerido")
        Period idPeriod,

        @NotNull(message = "El curso es requerido")
        Course idCourse,

        @NotNull(message = "El profesor es requerido")
        Person idTeacher,

        @NotNull(message = "El aula es requerida")
        Classroom idClassroom,

        @NotNull(message = "El día es requerido")
        Object day,

        @NotNull(message = "La hora de inicio es requerida")
        LocalTime startTime,

        @NotNull(message = "La hora de fin es requerida")
        LocalTime endTime
) {
}