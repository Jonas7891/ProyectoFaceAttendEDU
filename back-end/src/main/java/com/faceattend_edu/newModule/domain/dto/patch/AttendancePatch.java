package com.faceattend_edu.newModule.domain.dto.patch;

import jakarta.validation.constraints.NotNull;

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
