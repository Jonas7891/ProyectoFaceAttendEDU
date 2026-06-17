package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.EnrollmentRequest;
import com.faceattend_edu.domain.dto.response.EnrollmentResponse;
import com.faceattend_edu.domain.model.Course;
import com.faceattend_edu.domain.model.Enrollment;
import com.faceattend_edu.domain.model.Period;
import com.faceattend_edu.domain.model.Person;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class EnrollmentServiceMapper {

    private final PersonServiceMapper studentServiceMapper;
    private final CourseServiceMapper courseServiceMapper;
    private final PeriodServiceMapper periodServiceMapper;

    public Enrollment toDomain(EnrollmentRequest request,
                               Person student,
                               Course course,
                               Period period) {
        return new Enrollment(
                null,
                student,
                course,
                period,
                request.enrollmentDate(),
                request.status()
        );
    }

    public EnrollmentResponse toResponse(Enrollment enrollment) {
        return new EnrollmentResponse(
                enrollment.getId(),
                studentServiceMapper.toResponse(enrollment.getStudent()),
                courseServiceMapper.toResponse(enrollment.getCourse()),
                periodServiceMapper.toResponse(enrollment.getPeriod()),
                enrollment.getEnrollmentDate(),
                enrollment.getStatus()
        );
    }
}
