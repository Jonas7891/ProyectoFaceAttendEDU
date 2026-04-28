package com.faceattend_edu.domain.dto.request;

import com.faceattend_edu.domain.model.IotDevice;
import com.faceattend_edu.domain.model.Person;
import com.faceattend_edu.domain.model.Schedule;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record AttendanceRequest(
        @NotNull(message = "El estudiante es requerido")
        Person student,

        @NotNull(message = "El horario es requerido")
        Schedule schedule,

        @NotNull(message = "El dispositivo IoT es requerido")
        IotDevice iotDevice,

        @NotNull(message = "La fecha es requerida")
        LocalDate date,

        @NotNull(message = "La hora es requerida")
        LocalTime time,

        @NotNull(message = "El estado es requerido")
        Object status
) {
}