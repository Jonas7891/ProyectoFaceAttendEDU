package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Classroom;
import com.faceattend_edu.newModule.domain.model.Course;
import com.faceattend_edu.newModule.domain.model.Period;
import com.faceattend_edu.newModule.domain.model.Person;
import com.faceattend_edu.util.enums.Days;

import java.time.LocalDateTime;
import java.time.LocalTime;

public record ScheduleResponse(
        Long id,
        PeriodResponse period,
        CourseResponse course,
        PersonResponse teacher,
        ClassroomResponse classroom,
        Days day,
        LocalTime startTime,
        LocalTime endTime,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}