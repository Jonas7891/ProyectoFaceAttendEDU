package com.faceattend_edu.attendance.domain.dto.patch;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record AttendancePatch(
        UUID studentId,

        Long scheduleId,

        UUID deviceId,

        LocalDate date,

        LocalTime time
) {
}
