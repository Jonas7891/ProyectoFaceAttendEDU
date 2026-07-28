package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.IotDevice;
import com.faceattend_edu.newModule.domain.model.Person;
import com.faceattend_edu.newModule.domain.model.Schedule;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record AttendanceResponse(

        Long id,

        @JsonView(Views.Public.class)
        PersonResponse student,

        @JsonView(Views.Public.class)
        ScheduleResponse schedule,

        @JsonView(Views.Public.class)
        IotDeviceResponse device,

        @JsonView(Views.Public.class)
        LocalDate date,

        @JsonView(Views.Public.class)
        LocalTime time,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}