package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Course;
import com.faceattend_edu.newModule.domain.model.Period;
import com.faceattend_edu.newModule.domain.model.Person;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.Instant;
import java.time.LocalDateTime;

public record EnrollmentResponse(

        Long id,

        @JsonView(Views.Public.class)
        PersonResponse student,

        @JsonView(Views.Public.class)
        CourseResponse course,

        @JsonView(Views.Public.class)
        PeriodResponse period,

        @JsonView(Views.Public.class)
        LocalDateTime date,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}