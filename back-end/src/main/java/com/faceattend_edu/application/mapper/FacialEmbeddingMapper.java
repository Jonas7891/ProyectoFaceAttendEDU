package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.FacialEmbeddingRequest;
import com.faceattend_edu.domain.dto.response.FacialEmbeddingResponse;
import com.faceattend_edu.domain.model.FacialEmbedding;
import org.springframework.stereotype.Component;

@Component
public class FacialEmbeddingMapper {

    public FacialEmbedding toDomain(FacialEmbeddingRequest request) {
        return new FacialEmbedding(
                null,
                request.idPerson(),
                request.embedding(),
                request.modelVersion(),
                request.isActive(),
                request.createdAt()
        );
    }

    public FacialEmbeddingResponse toResponse(FacialEmbedding facialEmbedding) {
        return new FacialEmbeddingResponse(
                facialEmbedding.getId(),
                facialEmbedding.getIdPerson(),
                facialEmbedding.getEmbedding(),
                facialEmbedding.getModelVersion(),
                facialEmbedding.getIsActive(),
                facialEmbedding.getCreatedAt()
        );
    }
}
