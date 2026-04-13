package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.RoleModuleMapper;
import com.faceattend_edu.application.service.RoleModuleService;
import com.faceattend_edu.domain.dto.request.RoleModuleRequest;
import com.faceattend_edu.domain.dto.response.RoleModuleResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.RoleModule;
import com.faceattend_edu.domain.port.RoleModuleRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class RoleModuleServiceImpl implements RoleModuleService {

    private final RoleModuleRepositoryPort repository;
    private final RoleModuleMapper mapper;

    @Override
    public RoleModuleResponse findById(Integer id) {
        RoleModule roleModule = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("RoleModule", id));
        return mapper.toResponse(roleModule);
    }

    @Override
    public List<RoleModuleResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public RoleModuleResponse save(RoleModuleRequest request) {
        RoleModule roleModule = mapper.toDomain(request);
        RoleModule saved = repository.save(roleModule);
        return mapper.toResponse(saved);
    }

    @Override
    public RoleModuleResponse update(Integer id, RoleModuleRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("RoleModule", id));
        RoleModule updated = mapper.toDomain(request);
        updated.setId(id);
        RoleModule saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("RoleModule", id);
        }
        repository.deleteById(id);
    }
}
