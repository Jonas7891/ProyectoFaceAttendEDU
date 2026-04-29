package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.EnrollmentRequest;
import com.faceattend_edu.domain.dto.response.EnrollmentResponse;
import com.faceattend_edu.domain.model.Enrollment;
import org.springframework.stereotype.Component;

@Component
public class EnrollmentServiceMapper {

    public Enrollment toDomain(EnrollmentRequest request) {
        return new Enrollment(
                null,
                request.student(),
                request.course(),
                request.period(),
                request.enrollmentDate(),
                request.status()
        );
    }

    public EnrollmentResponse toResponse(Enrollment enrollment) {
        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getStudent(),
                enrollment.getCourse(),
                enrollment.getPeriod(),
                enrollment.getEnrollmentDate(),
                enrollment.getStatus()
        );
    }
}
