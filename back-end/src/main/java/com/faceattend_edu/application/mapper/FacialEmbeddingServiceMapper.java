package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.FacialEmbeddingRequest;
import com.faceattend_edu.domain.dto.response.FacialEmbeddingResponse;
import com.faceattend_edu.domain.model.FacialEmbedding;
import org.springframework.stereotype.Component;

@Component
public class FacialEmbeddingServiceMapper {

    public FacialEmbedding toDomain(FacialEmbeddingRequest request) {
        return new FacialEmbedding(
                null,
                request.person(),
                request.embedding(),
                request.modelVersion(),
                request.isActive(),
                request.createdAt()
        );
    }

    public FacialEmbeddingResponse toResponse(FacialEmbedding facialEmbedding) {
        return new FacialEmbeddingResponse(
                facialEmbedding.getId(),
                facialEmbedding.getPerson(),
                facialEmbedding.getEmbedding(),
                facialEmbedding.getModelVersion(),
                facialEmbedding.getIsActive(),
                facialEmbedding.getCreatedAt()
        );
    }
}
