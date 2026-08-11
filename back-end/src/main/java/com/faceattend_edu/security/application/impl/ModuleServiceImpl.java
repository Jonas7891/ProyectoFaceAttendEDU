package com.faceattend_edu.security.application.impl;

import com.faceattend_edu.security.domain.model.Module;
import com.faceattend_edu.security.application.mapper.ModuleServiceMapper;
import com.faceattend_edu.security.application.service.ModuleService;
import com.faceattend_edu.security.domain.dto.patch.ModulePatch;
import com.faceattend_edu.security.domain.dto.request.ModuleRequest;
import com.faceattend_edu.security.domain.dto.response.ModuleResponse;
import com.faceattend_edu.security.domain.port.ModuleRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class ModuleServiceImpl
        extends AbstractServiceImpl<Module, ModuleResponse, ModuleRequest, ModulePatch, Integer>
        implements ModuleService {

    private final ModuleRepositoryPort repository;
    private final ModuleServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<Module, Integer> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "Module";
    }

    @Override
    protected Function<ModuleRequest, Module> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<Module, ModuleResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<Module, ModuleRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<Module, ModulePatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<Module, Boolean> setStatus() {
        return Module::setStatus;
    }
}
