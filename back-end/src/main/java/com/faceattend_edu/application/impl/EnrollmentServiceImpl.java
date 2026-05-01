package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.EnrollmentServiceMapper;
import com.faceattend_edu.application.service.EnrollmentService;
import com.faceattend_edu.domain.dto.request.EnrollmentRequest;
import com.faceattend_edu.domain.dto.response.EnrollmentResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Course;
import com.faceattend_edu.domain.model.Enrollment;
import com.faceattend_edu.domain.model.Period;
import com.faceattend_edu.domain.model.Person;
import com.faceattend_edu.domain.port.CourseRepositoryPort;
import com.faceattend_edu.domain.port.EnrollmentRepositoryPort;
import com.faceattend_edu.domain.port.PeriodRepositoryPort;
import com.faceattend_edu.domain.port.PersonRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepositoryPort repository;
    private final EnrollmentServiceMapper mapper;

    private final PersonRepositoryPort personRepositoryPort;
    private final CourseRepositoryPort courseRepositoryPort;
    private final PeriodRepositoryPort periodRepositoryPort;

    @Override
    public EnrollmentResponse findById(Integer id) {
        Enrollment enrollment = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Enrollment", id));
        return mapper.toResponse(enrollment);
    }

    @Override
    public List<EnrollmentResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public EnrollmentResponse save(EnrollmentRequest request) {
        Person student = personRepositoryPort.findById(request.studentId())
                .orElseThrow(() -> new NotFoundException("Student", request.studentId()));
        Course course = courseRepositoryPort.findById(request.courseId())
                .orElseThrow(() -> new NotFoundException("Course", request.courseId()));
        Period period = periodRepositoryPort.findById(request.periodId())
                .orElseThrow(() -> new NotFoundException("Period", request.periodId()));

        Enrollment enrollment = mapper.toDomain(request, student, course, period);
        Enrollment saved = repository.save(enrollment);
        return mapper.toResponse(saved);
    }

    @Override
    public EnrollmentResponse update(Integer id, EnrollmentRequest request) {
        Enrollment existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Enrollment", id));
        Person student = personRepositoryPort.findById(request.studentId())
                .orElseThrow(() -> new NotFoundException("Student", request.studentId()));
        Course course = courseRepositoryPort.findById(request.courseId())
                .orElseThrow(() -> new NotFoundException("Course", request.courseId()));
        Period period = periodRepositoryPort.findById(request.periodId())
                .orElseThrow(() -> new NotFoundException("Period", request.periodId()));

        Enrollment updated = mapper.toDomain(request, student, course, period);
        updated.setId(id);
        Enrollment saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Enrollment", id);
        }
        repository.deleteById(id);
    }
}
