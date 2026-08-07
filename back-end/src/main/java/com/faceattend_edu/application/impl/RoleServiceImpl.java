package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.RoleServiceMapper;
import com.faceattend_edu.application.service.RoleService;
import com.faceattend_edu.domain.dto.request.RoleRequest;
import com.faceattend_edu.domain.dto.response.RoleResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Role;
import com.faceattend_edu.domain.port.RoleRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepositoryPort repository;
    private final RoleServiceMapper mapper;

    @Override
    public RoleResponse findById(Integer id) {
        Role role = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Role", id));
        return mapper.toResponse(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public RoleResponse save(RoleRequest request) {
        Role role = mapper.toDomain(request);
        Role saved = repository.save(role);
        return mapper.toResponse(saved);
    }

    @Override
    public RoleResponse update(Integer id, RoleRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Role", id));
        Role updated = mapper.toDomain(request);
        updated.setId(id);
        Role saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Role", id);
        }
        repository.deleteById(id);
    }
}
