package com.faceattend_edu.newModule.domain.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;

public record AttendanceResponse(
        Integer id,
        PersonResponse student,
        ScheduleResponse schedule,
        IotDeviceResponse iotDevice,
        LocalDate date,
        LocalTime time,
        Object status
) {
}