package com.faceattend_edu.academic.domain.dto.response;

import com.faceattend_edu.security.domain.dto.response.SchoolResponse;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.LocalDateTime;

public record CourseResponse(

        @JsonView({Views.ScheduleDetail.class, Views.ActiveEnrollments.class, Views.AttendanceDetail.class})
        Integer id,

        @JsonView(Views.Public.class)
        SchoolResponse school,

        @JsonView({Views.Public.class, Views.ScheduleDetail.class, Views.ActiveEnrollments.class, Views.AttendanceDetail.class, Views.PendingJustifications.class})
        String name,

        @JsonView({Views.Public.class, Views.ScheduleDetail.class, Views.ActiveEnrollments.class, Views.AttendanceDetail.class})
        String code,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}