package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.School;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record PersonResponse(

        @JsonView({Views.UserDetail.class, Views.ScheduleDetail.class, Views.ActiveEnrollments.class, Views.AttendanceDetail.class, Views.PendingJustifications.class, Views.ActiveFacialEmbeddings.class})
        UUID id,

        @JsonView({Views.Public.class, Views.UserDetail.class})
        SchoolResponse school,

        @JsonView({Views.Public.class, Views.UserDetail.class, Views.ScheduleDetail.class, Views.ActiveEnrollments.class, Views.AttendanceDetail.class, Views.AttendanceDetail.class, Views.PendingJustifications.class, Views.ActiveFacialEmbeddings.class, Views.AuditLog.class})
        String name,

        @JsonView({Views.Public.class, Views.UserDetail.class, Views.ScheduleDetail.class, Views.ActiveEnrollments.class, Views.AttendanceDetail.class, Views.AttendanceDetail.class, Views.PendingJustifications.class, Views.ActiveFacialEmbeddings.class, Views.AuditLog.class})
        String lastName,

        @JsonView({Views.Public.class, Views.UserDetail.class, Views.ActiveEnrollments.class})
        String email,

        @JsonView({Views.Public.class, Views.UserDetail.class})
        String phone,

        @JsonView({Views.Public.class, Views.UserDetail.class})
        boolean isStudent,

        @JsonView({Views.Public.class, Views.UserDetail.class})
        boolean isTeacher,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}