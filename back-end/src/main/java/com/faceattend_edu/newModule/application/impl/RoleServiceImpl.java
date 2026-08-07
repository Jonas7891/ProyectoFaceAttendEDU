package com.faceattend_edu.newModule.application.impl;

import com.faceattend_edu.newModule.application.mapper.ActionServiceMapper;
import com.faceattend_edu.newModule.application.mapper.RoleServiceMapper;
import com.faceattend_edu.newModule.application.service.RoleService;
import com.faceattend_edu.newModule.domain.dto.patch.RolePatch;
import com.faceattend_edu.newModule.domain.dto.request.RoleRequest;
import com.faceattend_edu.newModule.domain.dto.response.RoleResponse;
import com.faceattend_edu.newModule.domain.model.Role;
import com.faceattend_edu.newModule.domain.port.ActionRepositoryPort;
import com.faceattend_edu.newModule.domain.port.RoleRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class RoleServiceImpl
        extends AbstractServiceImpl<Role, RoleResponse, RoleRequest, RolePatch, Integer>
        implements RoleService {

    private final RoleRepositoryPort repository;
    private final RoleServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<Role, Integer> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "Role";
    }

    @Override
    protected Function<RoleRequest, Role> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<Role, RoleResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<Role, RoleRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<Role, RolePatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<Role, Boolean> setStatus() {
        return Role::setStatus;
    }
}
