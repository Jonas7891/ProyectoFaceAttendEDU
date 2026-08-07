package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.CourseServiceMapper;
import com.faceattend_edu.application.service.CourseService;
import com.faceattend_edu.domain.dto.request.CourseRequest;
import com.faceattend_edu.domain.dto.response.CourseResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Course;
import com.faceattend_edu.domain.model.School;
import com.faceattend_edu.domain.port.CourseRepositoryPort;
import com.faceattend_edu.domain.port.SchoolRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepositoryPort repository;
    private final CourseServiceMapper mapper;

    private final SchoolRepositoryPort schoolRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public CourseResponse findById(Integer id) {
        Course course = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course", id));
        return mapper.toResponse(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponse save(CourseRequest request) {
        School school = schoolRepositoryPort.findById(request.schoolId())
                .orElseThrow(() -> new NotFoundException("School", request.schoolId()));

        Course course = mapper.toDomain(request, school);
        Course saved = repository.save(course);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponse update(Integer id, CourseRequest request) {
        Course existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Course", id));
        School school = schoolRepositoryPort.findById(request.schoolId())
                .orElseThrow(() -> new NotFoundException("School", request.schoolId()));

        Course updated = mapper.toDomain(request, school);
        updated.setId(id);
        Course saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Course", id);
        }
        repository.deleteById(id);
    }
}
