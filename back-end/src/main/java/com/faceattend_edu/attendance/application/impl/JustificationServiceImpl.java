package com.faceattend_edu.attendance.application.impl;

import com.faceattend_edu.attendance.application.mapper.JustificationServiceMapper;
import com.faceattend_edu.attendance.application.service.JustificationService;
import com.faceattend_edu.attendance.domain.dto.patch.JustificationPatch;
import com.faceattend_edu.attendance.domain.dto.request.JustificationRequest;
import com.faceattend_edu.attendance.domain.dto.response.JustificationResponse;
import com.faceattend_edu.attendance.domain.model.Justification;
import com.faceattend_edu.attendance.domain.port.JustificationRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class JustificationServiceImpl
        extends AbstractServiceImpl<Justification, JustificationResponse, JustificationRequest, JustificationPatch, Long>
        implements JustificationService {

    private final JustificationRepositoryPort repository;
    private final JustificationServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<Justification, Long> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "Justification";
    }

    @Override
    protected Function<JustificationRequest, Justification> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<Justification, JustificationResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<Justification, JustificationRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<Justification, JustificationPatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<Justification, Boolean> setStatus() {
        return Justification::setStatus;
    }
}
