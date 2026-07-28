package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.IotDevice;
import com.faceattend_edu.newModule.domain.model.Person;
import com.faceattend_edu.newModule.domain.model.Schedule;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record AttendanceResponse(
        Long id,
        PersonResponse student,
        ScheduleResponse schedule,
        IotDeviceResponse device,
        LocalDate date,
        LocalTime time,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}