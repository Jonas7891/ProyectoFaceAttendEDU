package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.UserRoleMapper;
import com.faceattend_edu.application.service.UserRoleService;
import com.faceattend_edu.domain.dto.request.UserRoleRequest;
import com.faceattend_edu.domain.dto.response.UserRoleResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.UserRole;
import com.faceattend_edu.domain.port.UserRoleRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class UserRoleServiceImpl implements UserRoleService {

    private final UserRoleRepositoryPort repository;
    private final UserRoleMapper mapper;

    @Override
    public UserRoleResponse findById(Integer id) {
        UserRole userRole = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("UserRole", id));
        return mapper.toResponse(userRole);
    }

    @Override
    public List<UserRoleResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public UserRoleResponse save(UserRoleRequest request) {
        UserRole userRole = mapper.toDomain(request);
        UserRole saved = repository.save(userRole);
        return mapper.toResponse(saved);
    }

    @Override
    public UserRoleResponse update(Integer id, UserRoleRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("UserRole", id));
        UserRole updated = mapper.toDomain(request);
        updated.setId(id);
        UserRole saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("UserRole", id);
        }
        repository.deleteById(id);
    }
}
