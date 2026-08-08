package com.faceattend_edu.attendance.domain.dto.response;

import com.faceattend_edu.iotDevice.domain.dto.response.IotDeviceResponse;
import com.faceattend_edu.security.domain.dto.response.PersonResponse;
import com.faceattend_edu.academic.domain.dto.response.ScheduleResponse;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record AttendanceResponse(

        @JsonView({Views.AttendanceDetail.class, Views.PendingJustifications.class})
        Long id,

        @JsonView({Views.Public.class, Views.AttendanceDetail.class, Views.PendingJustifications.class})
        PersonResponse student,

        @JsonView({Views.Public.class, Views.AttendanceDetail.class, Views.PendingJustifications.class})
        ScheduleResponse schedule,

        @JsonView({Views.Public.class, Views.AttendanceDetail.class})
        IotDeviceResponse device,

        @JsonView({Views.Public.class, Views.AttendanceDetail.class, Views.PendingJustifications.class})
        LocalDate date,

        @JsonView({Views.Public.class, Views.AttendanceDetail.class})
        LocalTime time,

        @JsonView({Views.AttendanceDetail.class, Views.PendingJustifications.class})
        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}