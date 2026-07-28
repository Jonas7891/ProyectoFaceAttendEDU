package com.faceattend_edu.newModule.application.impl;

import com.faceattend_edu.newModule.application.mapper.ActionServiceMapper;
import com.faceattend_edu.newModule.application.mapper.UserServiceMapper;
import com.faceattend_edu.newModule.application.service.UserService;
import com.faceattend_edu.newModule.domain.dto.patch.UserPatch;
import com.faceattend_edu.newModule.domain.dto.request.UserRequest;
import com.faceattend_edu.newModule.domain.dto.response.UserResponse;
import com.faceattend_edu.newModule.domain.model.User;
import com.faceattend_edu.newModule.domain.port.ActionRepositoryPort;
import com.faceattend_edu.newModule.domain.port.UserRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class UserServiceImpl
        extends AbstractServiceImpl<User, UserResponse, UserRequest, UserPatch, UUID>
        implements UserService {

    private final UserRepositoryPort repository;
    private final UserServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<User, UUID> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "User";
    }

    @Override
    protected Function<UserRequest, User> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<User, UserResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<User, UserRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<User, UserPatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<User, Boolean> setStatus() {
        return User::setStatus;
    }
}
