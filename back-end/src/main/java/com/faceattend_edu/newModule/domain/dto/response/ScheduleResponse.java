package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Classroom;
import com.faceattend_edu.newModule.domain.model.Course;
import com.faceattend_edu.newModule.domain.model.Period;
import com.faceattend_edu.newModule.domain.model.Person;
import com.faceattend_edu.util.Views;
import com.faceattend_edu.util.enums.Days;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.LocalDateTime;
import java.time.LocalTime;

public record ScheduleResponse(

        @JsonView({Views.ScheduleDetail.class, Views.AttendanceDetail.class})
        Long id,

        @JsonView({Views.Public.class, Views.ScheduleDetail.class})
        PeriodResponse period,

        @JsonView({Views.Public.class, Views.ScheduleDetail.class, Views.AttendanceDetail.class, Views.PendingJustifications.class})
        CourseResponse course,

        @JsonView({Views.Public.class, Views.ScheduleDetail.class, Views.AttendanceDetail.class})
        PersonResponse teacher,

        @JsonView({Views.Public.class, Views.ScheduleDetail.class, Views.AttendanceDetail.class})
        ClassroomResponse classroom,

        @JsonView({Views.Public.class, Views.ScheduleDetail.class})
        Days day,

        @JsonView({Views.Public.class, Views.ScheduleDetail.class})
        LocalTime startTime,

        @JsonView({Views.Public.class, Views.ScheduleDetail.class})
        LocalTime endTime,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}