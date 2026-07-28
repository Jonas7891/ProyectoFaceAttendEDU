package com.faceattend_edu.newModule.application.impl;

import com.faceattend_edu.newModule.application.mapper.ActionServiceMapper;
import com.faceattend_edu.newModule.application.mapper.PeriodServiceMapper;
import com.faceattend_edu.newModule.application.service.PeriodService;
import com.faceattend_edu.newModule.domain.dto.patch.PeriodPatch;
import com.faceattend_edu.newModule.domain.dto.request.PeriodRequest;
import com.faceattend_edu.newModule.domain.dto.response.PeriodResponse;
import com.faceattend_edu.newModule.domain.model.Period;
import com.faceattend_edu.newModule.domain.port.ActionRepositoryPort;
import com.faceattend_edu.newModule.domain.port.PeriodRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class PeriodServiceImpl
        extends AbstractServiceImpl<Period, PeriodResponse, PeriodRequest, PeriodPatch, Integer>
        implements PeriodService {

    private final PeriodRepositoryPort repository;
    private final PeriodServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<Period, Integer> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "Period";
    }

    @Override
    protected Function<PeriodRequest, Period> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<Period, PeriodResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<Period, PeriodRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<Period, PeriodPatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<Period, Boolean> setStatus() {
        return Period::setStatus;
    }
}
