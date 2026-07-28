package com.faceattend_edu.newModule.application.impl;

import com.faceattend_edu.newModule.application.mapper.ActionServiceMapper;
import com.faceattend_edu.newModule.application.mapper.ViewServiceMapper;
import com.faceattend_edu.newModule.application.service.ViewService;
import com.faceattend_edu.newModule.domain.dto.patch.ViewPatch;
import com.faceattend_edu.newModule.domain.dto.request.ViewRequest;
import com.faceattend_edu.newModule.domain.dto.response.ViewResponse;
import com.faceattend_edu.newModule.domain.model.View;
import com.faceattend_edu.newModule.domain.port.ActionRepositoryPort;
import com.faceattend_edu.newModule.domain.port.ViewRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class ViewServiceImpl
        extends AbstractServiceImpl<View, ViewResponse, ViewRequest, ViewPatch, Integer>
        implements ViewService {

    private final ViewRepositoryPort repository;
    private final ViewServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<View, Integer> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "View";
    }

    @Override
    protected Function<ViewRequest, View> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<View, ViewResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<View, ViewRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<View, ViewPatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<View, Boolean> setStatus() {
        return View::setStatus;
    }
}
