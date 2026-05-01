package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.ViewServiceMapper;
import com.faceattend_edu.application.service.ViewService;
import com.faceattend_edu.domain.dto.request.ViewRequest;
import com.faceattend_edu.domain.dto.response.ViewResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Action;
import com.faceattend_edu.domain.model.View;
import com.faceattend_edu.domain.port.ActionRepositoryPort;
import com.faceattend_edu.domain.port.ViewRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
public class ViewServiceImpl implements ViewService {

    private final ViewRepositoryPort repository;
    private final ViewServiceMapper mapper;

    private final ActionRepositoryPort actionRepositoryPort;

    @Override
    public ViewResponse findById(Integer id) {
        View view = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("View", id));
        return mapper.toResponse(view);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ViewResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public ViewResponse save(ViewRequest request) {
        List<Action> actions = actionRepositoryPort.findAllById(request.actionIds());

        View view = mapper.toDomain(request, actions);
        View saved = repository.save(view);
        return mapper.toResponse(saved);
    }

    @Override
    public ViewResponse update(Integer id, ViewRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("View", id));
        List<Action> actions = actionRepositoryPort.findAllById(request.actionIds());

        View updated = mapper.toDomain(request, actions);
        updated.setId(id);
        View saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("View", id);
        }
        repository.deleteById(id);
    }
}
