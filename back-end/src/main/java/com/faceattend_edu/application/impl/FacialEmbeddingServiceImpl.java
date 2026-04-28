package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.FacialEmbeddingServiceMapper;
import com.faceattend_edu.application.service.FacialEmbeddingService;
import com.faceattend_edu.domain.dto.request.FacialEmbeddingRequest;
import com.faceattend_edu.domain.dto.response.FacialEmbeddingResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.FacialEmbedding;
import com.faceattend_edu.domain.port.FacialEmbeddingRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class FacialEmbeddingServiceImpl implements FacialEmbeddingService {

    private final FacialEmbeddingRepositoryPort repository;
    private final FacialEmbeddingServiceMapper mapper;

    @Override
    public FacialEmbeddingResponse findById(Integer id) {
        FacialEmbedding facialEmbedding = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("FacialEmbedding", id));
        return mapper.toResponse(facialEmbedding);
    }

    @Override
    public List<FacialEmbeddingResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public FacialEmbeddingResponse save(FacialEmbeddingRequest request) {
        FacialEmbedding facialEmbedding = mapper.toDomain(request);
        FacialEmbedding saved = repository.save(facialEmbedding);
        return mapper.toResponse(saved);
    }

    @Override
    public FacialEmbeddingResponse update(Integer id, FacialEmbeddingRequest request) {
        FacialEmbedding existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("FacialEmbedding", id));
        FacialEmbedding updated = mapper.toDomain(request);
        updated.setId(id);
        FacialEmbedding saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("FacialEmbedding", id);
        }
        repository.deleteById(id);
    }
}
