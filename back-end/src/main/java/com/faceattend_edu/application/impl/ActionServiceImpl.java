package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.ActionServiceMapper;
import com.faceattend_edu.application.service.ActionService;
import com.faceattend_edu.domain.dto.request.ActionRequest;
import com.faceattend_edu.domain.dto.response.ActionResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Action;
import com.faceattend_edu.domain.port.ActionRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class ActionServiceImpl implements ActionService {

    private final ActionRepositoryPort repository;
    private final ActionServiceMapper mapper;

    @Override
    public ActionResponse findById(Integer id) {
        Action action = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Action", id));
        return mapper.toResponse(action);
    }

    @Override
    public List<ActionResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public ActionResponse save(ActionRequest request) {
        Action action = mapper.toDomain(request);
        Action saved = repository.save(action);
        return mapper.toResponse(saved);
    }

    @Override
    public ActionResponse update(Integer id, ActionRequest request) {
        Action existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Action", id));
        // Update fields if needed, but since mapper.toDomain creates new, perhaps merge
        Action updated = mapper.toDomain(request);
        updated.setId(id); // Assuming Action has setId
        Action saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Action", id);
        }
        repository.deleteById(id);
    }
}
