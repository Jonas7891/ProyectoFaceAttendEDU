package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.UserRoleServiceMapper;
import com.faceattend_edu.application.service.UserRoleService;
import com.faceattend_edu.domain.dto.request.UserRoleRequest;
import com.faceattend_edu.domain.dto.response.UserRoleResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.UserRole;
import com.faceattend_edu.domain.port.UserRoleRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@AllArgsConstructor
@Service
public class UserRoleServiceImpl implements UserRoleService {

    private final UserRoleRepositoryPort repository;
    private final UserRoleServiceMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public UserRoleResponse findByIdUserAndIdRole(Integer userId, Integer roleId) {
        UserRole userRole = repository.findByIdUserAndIdRole(userId, roleId)
                .orElseThrow(() -> new NotFoundException("UserRole", "userId/roleId", userId + "/" + roleId));
        return mapper.toResponse(userRole);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserRoleResponse> findByIdUser(Integer userId) {
        return repository.findByIdUser(userId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserRoleResponse> findByIdRole(Integer roleId) {
        return repository.findByIdRole(roleId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserRoleResponse> findActiveRolesByUserId(Integer userId) {
        return repository.findActiveRolesByUserId(userId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserRoleResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public UserRoleResponse save(UserRoleRequest request) {
        // Verificar si ya existe la relación
        if (repository.existsByIdUserAndIdRole(request.userId(), request.roleId())) {
            throw new IllegalArgumentException(
                    String.format("El usuario %d ya tiene asignado el rol %d", request.userId(), request.roleId())
            );
        }

        UserRole userRole = mapper.toDomain(request);
        userRole.setAssignedDate(Instant.now());

        UserRole saved = repository.save(userRole);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public UserRoleResponse updateExpiryDate(Integer userId, Integer roleId, Instant expiryDate) {
        UserRole userRole = repository.findByIdUserAndIdRole(userId, roleId)
                .orElseThrow(() -> new NotFoundException("UserRole", "userId/roleId", userId + "/" + roleId));

        userRole.setExpiryDate(expiryDate);
        UserRole updated = repository.save(userRole);
        return mapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteByIdUserAndIdRole(Integer userId, Integer roleId) {
        if (repository.findByIdUserAndIdRole(userId, roleId).isEmpty()) {
            throw new NotFoundException("UserRole", "userId/roleId", userId + "/" + roleId);
        }
        repository.deleteByIdUserAndIdRole(userId, roleId);
    }

    @Override
    @Transactional
    public void deleteByIdUser(Integer userId) {
        List<UserRole> userRoles = repository.findByIdUser(userId);
        if (userRoles.isEmpty()) {
            throw new NotFoundException("UserRole", "userId", String.valueOf(userId));
        }
        repository.deleteByIdUser(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean userHasRole(Integer userId, Integer roleId) {
        return repository.existsByIdUserAndIdRole(userId, roleId);
    }
}