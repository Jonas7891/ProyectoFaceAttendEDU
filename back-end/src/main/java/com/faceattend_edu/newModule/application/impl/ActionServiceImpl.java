package com.faceattend_edu.newModule.application.impl;

import com.faceattend_edu.newModule.application.mapper.ActionServiceMapper;
import com.faceattend_edu.newModule.application.service.ActionService;
import com.faceattend_edu.newModule.domain.dto.patch.ActionPatch;
import com.faceattend_edu.newModule.domain.dto.request.ActionRequest;
import com.faceattend_edu.newModule.domain.dto.response.ActionResponse;
import com.faceattend_edu.newModule.domain.model.Action;
import com.faceattend_edu.newModule.domain.port.ActionRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class ActionServiceImpl
        extends AbstractServiceImpl<Action, ActionResponse, ActionRequest, ActionPatch, Integer>
        implements ActionService {

    private final ActionRepositoryPort repository;
    private final ActionServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<Action, Integer> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "Action";
    }

    @Override
    protected Function<ActionRequest, Action> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<Action, ActionResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<Action, ActionRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<Action, ActionPatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<Action, Boolean> setStatus() {
        return Action::setStatus;
    }
}
