package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.ModuleServiceMapper;
import com.faceattend_edu.application.service.ModuleService;
import com.faceattend_edu.domain.dto.request.ModuleRequest;
import com.faceattend_edu.domain.dto.response.ModuleResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Module;
import com.faceattend_edu.domain.model.View;
import com.faceattend_edu.domain.port.ModuleRepositoryPort;
import com.faceattend_edu.domain.port.ViewRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepositoryPort repository;
    private final ModuleServiceMapper mapper;

    private final ViewRepositoryPort viewRepositoryPort;

    @Override
    public ModuleResponse findById(Integer id) {
        Module module = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Module", id));
        return mapper.toResponse(module);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public ModuleResponse save(ModuleRequest request) {
        List<View> views = viewRepositoryPort.findAllById(request.viewIds());

        Module module = mapper.toDomain(request, views);
        Module saved = repository.save(module);
        return mapper.toResponse(saved);
    }

    @Override
    public ModuleResponse update(Integer id, ModuleRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Module", id));
        List<View> views = viewRepositoryPort.findAllById(request.viewIds());

        Module updated = mapper.toDomain(request, views);
        updated.setId(id);
        Module saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Module", id);
        }
        repository.deleteById(id);
    }
}
