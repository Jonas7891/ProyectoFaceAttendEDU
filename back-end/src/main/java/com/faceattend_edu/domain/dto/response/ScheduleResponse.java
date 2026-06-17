package com.faceattend_edu.domain.dto.response;

import java.time.LocalTime;

public record ScheduleResponse(
        Integer id,
        PeriodResponse period,
        CourseResponse course,
        PersonResponse teacher,
        ClassroomResponse Classroom,
        Object day,
        LocalTime startTime,
        LocalTime endTime
) {
}