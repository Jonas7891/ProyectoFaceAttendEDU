package com.faceattend_edu.newModule.application.impl;

import com.faceattend_edu.newModule.application.mapper.ActionServiceMapper;
import com.faceattend_edu.newModule.application.mapper.EnrollmentServiceMapper;
import com.faceattend_edu.newModule.application.service.EnrollmentService;
import com.faceattend_edu.newModule.domain.dto.patch.EnrollmentPatch;
import com.faceattend_edu.newModule.domain.dto.request.EnrollmentRequest;
import com.faceattend_edu.newModule.domain.dto.response.EnrollmentResponse;
import com.faceattend_edu.newModule.domain.model.Enrollment;
import com.faceattend_edu.newModule.domain.port.ActionRepositoryPort;
import com.faceattend_edu.newModule.domain.port.EnrollmentRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class EnrollmentServiceImpl
        extends AbstractServiceImpl<Enrollment, EnrollmentResponse, EnrollmentRequest, EnrollmentPatch, Long>
        implements EnrollmentService {

    private final EnrollmentRepositoryPort repository;
    private final EnrollmentServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<Enrollment, Long> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "Enrollment";
    }

    @Override
    protected Function<EnrollmentRequest, Enrollment> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<Enrollment, EnrollmentResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<Enrollment, EnrollmentRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<Enrollment, EnrollmentPatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<Enrollment, Boolean> setStatus() {
        return Enrollment::setStatus;
    }
}
