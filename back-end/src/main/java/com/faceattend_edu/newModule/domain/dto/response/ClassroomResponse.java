package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.School;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.LocalDateTime;

public record ClassroomResponse(

        @JsonView({Views.ScheduleDetail.class, Views.DeviceStatus.class})
        Integer id,

        @JsonView({Views.Public.class, Views.DeviceStatus.class})
        SchoolResponse school,

        @JsonView({Views.Public.class, Views.ScheduleDetail.class, Views.AttendanceDetail.class, Views.DeviceStatus.class})
        String name,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}