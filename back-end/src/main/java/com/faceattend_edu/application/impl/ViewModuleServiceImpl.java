package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.ViewModuleMapper;
import com.faceattend_edu.application.service.ViewModuleService;
import com.faceattend_edu.domain.dto.request.ViewModuleRequest;
import com.faceattend_edu.domain.dto.response.ViewModuleResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.ViewModule;
import com.faceattend_edu.domain.port.ViewModuleRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class ViewModuleServiceImpl implements ViewModuleService {

    private final ViewModuleRepositoryPort repository;
    private final ViewModuleMapper mapper;

    @Override
    public ViewModuleResponse findById(Integer id) {
        ViewModule viewModule = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("ViewModule", id));
        return mapper.toResponse(viewModule);
    }

    @Override
    public List<ViewModuleResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public ViewModuleResponse save(ViewModuleRequest request) {
        ViewModule viewModule = mapper.toDomain(request);
        ViewModule saved = repository.save(viewModule);
        return mapper.toResponse(saved);
    }

    @Override
    public ViewModuleResponse update(Integer id, ViewModuleRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("ViewModule", id));
        ViewModule updated = mapper.toDomain(request);
        updated.setId(id);
        ViewModule saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("ViewModule", id);
        }
        repository.deleteById(id);
    }
}
