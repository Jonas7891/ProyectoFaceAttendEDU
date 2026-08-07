package com.faceattend_edu.newModule.domain.dto.patch;

import com.faceattend_edu.util.enums.Days;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;
import java.util.UUID;

public record SchedulePatch(
        Integer periodId,

        Integer courseId,

        UUID teacherId,

        Integer classroomId,

        Days day,

        LocalTime startTime,

        LocalTime endTime
) {
}
