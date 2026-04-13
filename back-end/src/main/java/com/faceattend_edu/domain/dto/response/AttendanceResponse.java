package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.IotDevice;
import com.faceattend_edu.domain.model.Person;
import com.faceattend_edu.domain.model.Schedule;

import java.time.LocalDate;
import java.time.LocalTime;

public record AttendanceResponse(
        Integer id,
        Person idStudent,
        Schedule idSchedule,
        IotDevice idDevice,
        LocalDate date,
        LocalTime time,
        Object status
) {
}