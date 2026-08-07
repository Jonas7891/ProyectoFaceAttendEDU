package com.faceattend_edu.newModule.application.impl;

import com.faceattend_edu.newModule.application.mapper.ActionServiceMapper;
import com.faceattend_edu.newModule.application.mapper.ScheduleServiceMapper;
import com.faceattend_edu.newModule.application.service.ScheduleService;
import com.faceattend_edu.newModule.domain.dto.patch.SchedulePatch;
import com.faceattend_edu.newModule.domain.dto.request.ScheduleRequest;
import com.faceattend_edu.newModule.domain.dto.response.ScheduleResponse;
import com.faceattend_edu.newModule.domain.model.Schedule;
import com.faceattend_edu.newModule.domain.port.ActionRepositoryPort;
import com.faceattend_edu.newModule.domain.port.ScheduleRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class ScheduleServiceImpl
        extends AbstractServiceImpl<Schedule, ScheduleResponse, ScheduleRequest, SchedulePatch, Long>
        implements ScheduleService {

    private final ScheduleRepositoryPort repository;
    private final ScheduleServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<Schedule, Long> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "Schedule";
    }

    @Override
    protected Function<ScheduleRequest, Schedule> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<Schedule, ScheduleResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<Schedule, ScheduleRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<Schedule, SchedulePatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<Schedule, Boolean> setStatus() {
        return Schedule::setStatus;
    }
}
