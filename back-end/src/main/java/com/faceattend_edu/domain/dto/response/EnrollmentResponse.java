package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.Course;
import com.faceattend_edu.domain.model.Period;
import com.faceattend_edu.domain.model.Person;

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