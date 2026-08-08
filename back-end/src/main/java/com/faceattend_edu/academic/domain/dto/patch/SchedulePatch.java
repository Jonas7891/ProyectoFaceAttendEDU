package com.faceattend_edu.academic.domain.dto.patch;

import com.faceattend_edu.util.enums.Days;

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
