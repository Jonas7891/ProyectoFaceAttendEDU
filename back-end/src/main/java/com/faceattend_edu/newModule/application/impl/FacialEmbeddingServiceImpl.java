package com.faceattend_edu.newModule.application.impl;

import com.faceattend_edu.newModule.application.mapper.ActionServiceMapper;
import com.faceattend_edu.newModule.application.mapper.FacialEmbeddingServiceMapper;
import com.faceattend_edu.newModule.application.service.FacialEmbeddingService;
import com.faceattend_edu.newModule.domain.dto.patch.FacialEmbeddingPatch;
import com.faceattend_edu.newModule.domain.dto.request.FacialEmbeddingRequest;
import com.faceattend_edu.newModule.domain.dto.response.FacialEmbeddingResponse;
import com.faceattend_edu.newModule.domain.model.FacialEmbedding;
import com.faceattend_edu.newModule.domain.port.ActionRepositoryPort;
import com.faceattend_edu.newModule.domain.port.FacialEmbeddingRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class FacialEmbeddingServiceImpl
        extends AbstractServiceImpl<FacialEmbedding, FacialEmbeddingResponse, FacialEmbeddingRequest, FacialEmbeddingPatch, UUID>
        implements FacialEmbeddingService {

    private final FacialEmbeddingRepositoryPort repository;
    private final FacialEmbeddingServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<FacialEmbedding, UUID> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "FacialEmbedding";
    }

    @Override
    protected Function<FacialEmbeddingRequest, FacialEmbedding> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<FacialEmbedding, FacialEmbeddingResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<FacialEmbedding, FacialEmbeddingRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<FacialEmbedding, FacialEmbeddingPatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<FacialEmbedding, Boolean> setStatus() {
        return FacialEmbedding::setStatus;
    }
}
