package com.faceattend_edu.academic.application.impl;

import com.faceattend_edu.academic.application.mapper.CourseServiceMapper;
import com.faceattend_edu.academic.application.service.CourseService;
import com.faceattend_edu.academic.domain.dto.patch.CoursePatch;
import com.faceattend_edu.academic.domain.dto.request.CourseRequest;
import com.faceattend_edu.academic.domain.dto.response.CourseResponse;
import com.faceattend_edu.academic.domain.model.Course;
import com.faceattend_edu.academic.domain.port.CourseRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class CourseServiceImpl
        extends AbstractServiceImpl<Course, CourseResponse, CourseRequest, CoursePatch, Integer>
        implements CourseService {

    private final CourseRepositoryPort repository;
    private final CourseServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<Course, Integer> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "Course";
    }

    @Override
    protected Function<CourseRequest, Course> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<Course, CourseResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<Course, CourseRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<Course, CoursePatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<Course, Boolean> setStatus() {
        return Course::setStatus;
    }
}
