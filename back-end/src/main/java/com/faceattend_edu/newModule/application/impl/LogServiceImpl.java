package com.faceattend_edu.newModule.application.impl;

import com.faceattend_edu.newModule.application.mapper.ActionServiceMapper;
import com.faceattend_edu.newModule.application.mapper.LogServiceMapper;
import com.faceattend_edu.newModule.application.service.LogService;
import com.faceattend_edu.newModule.domain.dto.patch.LogPatch;
import com.faceattend_edu.newModule.domain.dto.request.LogRequest;
import com.faceattend_edu.newModule.domain.dto.response.LogResponse;
import com.faceattend_edu.newModule.domain.model.Log;
import com.faceattend_edu.newModule.domain.port.ActionRepositoryPort;
import com.faceattend_edu.newModule.domain.port.LogRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class LogServiceImpl
        extends AbstractServiceImpl<Log, LogResponse, LogRequest, LogPatch, Long>
        implements LogService {

    private final LogRepositoryPort repository;
    private final LogServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<Log, Long> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "Log";
    }

    @Override
    protected Function<LogRequest, Log> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<Log, LogResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<Log, LogRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<Log, LogPatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<Log, Boolean> setStatus() {
        return Log::setStatus;
    }
}
