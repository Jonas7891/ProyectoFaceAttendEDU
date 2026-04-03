package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.JustificationMapper;
import com.faceattend_edu.application.service.JustificationService;
import com.faceattend_edu.domain.dto.request.JustificationRequest;
import com.faceattend_edu.domain.dto.response.JustificationResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Justification;
import com.faceattend_edu.domain.port.JustificationRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class JustificationServiceImpl implements JustificationService {

    private final JustificationRepositoryPort repository;
    private final JustificationMapper mapper;

    @Override
    public JustificationResponse findById(Integer id) {
        Justification justification = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Justification", id));
        return mapper.toResponse(justification);
    }

    @Override
    public List<JustificationResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public JustificationResponse save(JustificationRequest request) {
        Justification justification = mapper.toDomain(request);
        Justification saved = repository.save(justification);
        return mapper.toResponse(saved);
    }

    @Override
    public JustificationResponse update(Integer id, JustificationRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Justification", id));
        Justification updated = mapper.toDomain(request);
        updated.setId(id);
        Justification saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Justification", id);
        }
        repository.deleteById(id);
    }
}
