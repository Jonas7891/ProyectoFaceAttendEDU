package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Course;
import com.faceattend_edu.newModule.domain.model.Period;
import com.faceattend_edu.newModule.domain.model.Person;

import java.time.Instant;
import java.time.LocalDateTime;

public record EnrollmentResponse(
        Long id,
        PersonResponse student,
        CourseResponse course,
        PeriodResponse period,
        LocalDateTime date,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}