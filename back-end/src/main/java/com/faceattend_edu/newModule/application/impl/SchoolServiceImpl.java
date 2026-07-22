package com.faceattend_edu.newModule.application.impl;

import com.faceattend_edu.newModule.application.mapper.SchoolServiceMapper;
import com.faceattend_edu.newModule.application.service.SchoolService;
import com.faceattend_edu.newModule.domain.dto.patch.SchoolPatch;
import com.faceattend_edu.newModule.domain.dto.request.SchoolRequest;
import com.faceattend_edu.newModule.domain.dto.response.SchoolResponse;
import com.faceattend_edu.newModule.domain.model.School;
import com.faceattend_edu.newModule.domain.port.SchoolRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class SchoolServiceImpl
        extends AbstractServiceImpl<School, SchoolResponse, SchoolRequest, SchoolPatch, UUID>
        implements SchoolService {

    private final SchoolRepositoryPort repository;
    private final SchoolServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<School, UUID> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "School";
    }

    @Override
    protected Function<SchoolRequest, School> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<School, SchoolResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<School, SchoolRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<School, SchoolPatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<School, Boolean> setStatus() {
        return School::setStatus;
    }
}
