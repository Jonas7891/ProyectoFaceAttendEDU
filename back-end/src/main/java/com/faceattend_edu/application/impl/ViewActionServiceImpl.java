package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.ViewActionMapper;
import com.faceattend_edu.application.service.ViewActionService;
import com.faceattend_edu.domain.dto.request.ViewActionRequest;
import com.faceattend_edu.domain.dto.response.ViewActionResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.ViewAction;
import com.faceattend_edu.domain.port.ViewActionRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class ViewActionServiceImpl implements ViewActionService {

    private final ViewActionRepositoryPort repository;
    private final ViewActionMapper mapper;

    @Override
    public ViewActionResponse findById(Integer id) {
        ViewAction viewAction = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("ViewAction", id));
        return mapper.toResponse(viewAction);
    }

    @Override
    public List<ViewActionResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public ViewActionResponse save(ViewActionRequest request) {
        ViewAction viewAction = mapper.toDomain(request);
        ViewAction saved = repository.save(viewAction);
        return mapper.toResponse(saved);
    }

    @Override
    public ViewActionResponse update(Integer id, ViewActionRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("ViewAction", id));
        ViewAction updated = mapper.toDomain(request);
        updated.setId(id);
        ViewAction saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("ViewAction", id);
        }
        repository.deleteById(id);
    }
}
