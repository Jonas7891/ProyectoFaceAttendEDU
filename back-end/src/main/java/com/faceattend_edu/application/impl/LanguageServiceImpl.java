package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.LanguageMapper;
import com.faceattend_edu.application.service.LanguageService;
import com.faceattend_edu.domain.dto.request.LanguageRequest;
import com.faceattend_edu.domain.dto.response.LanguageResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Language;
import com.faceattend_edu.domain.port.LanguageRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class LanguageServiceImpl implements LanguageService {

    private final LanguageRepositoryPort repository;
    private final LanguageMapper mapper;

    @Override
    public LanguageResponse findById(Integer id) {
        Language language = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Language", id));
        return mapper.toResponse(language);
    }

    @Override
    public List<LanguageResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public LanguageResponse save(LanguageRequest request) {
        Language language = mapper.toDomain(request);
        Language saved = repository.save(language);
        return mapper.toResponse(saved);
    }

    @Override
    public LanguageResponse update(Integer id, LanguageRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Language", id));
        Language updated = mapper.toDomain(request);
        updated.setId(id);
        Language saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Language", id);
        }
        repository.deleteById(id);
    }
}
