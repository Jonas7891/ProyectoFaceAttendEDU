package com.faceattend_edu.newModule.domain.dto.response;

import java.time.Instant;

public record EnrollmentResponse(
        Integer id,
        PersonResponse student,
        CourseResponse course,
        PeriodResponse period,
        Instant enrollmentDate,
        Object status
) {
}