package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.Classroom;
import com.faceattend_edu.domain.model.Course;
import com.faceattend_edu.domain.model.Period;
import com.faceattend_edu.domain.model.Person;

import java.time.LocalTime;

public record ScheduleResponse(
        Integer id,
        Period period,
        Course course,
        Person teacher,
        Classroom Classroom,
        Object day,
        LocalTime startTime,
        LocalTime endTime
) {
}