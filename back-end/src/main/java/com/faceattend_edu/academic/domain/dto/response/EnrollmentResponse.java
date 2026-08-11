package com.faceattend_edu.academic.domain.dto.response;

import com.faceattend_edu.security.domain.dto.response.PersonResponse;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.LocalDateTime;

public record EnrollmentResponse(

        @JsonView(Views.ActiveEnrollments.class)
        Long id,

        @JsonView({Views.Public.class, Views.ActiveEnrollments.class})
        PersonResponse student,

        @JsonView({Views.Public.class, Views.ActiveEnrollments.class})
        CourseResponse course,

        @JsonView({Views.Public.class, Views.ActiveEnrollments.class})
        PeriodResponse period,

        @JsonView({Views.Public.class, Views.ActiveEnrollments.class})
        LocalDateTime date,

        @JsonView(Views.ActiveEnrollments.class)
        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}