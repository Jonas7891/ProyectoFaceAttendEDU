package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.FacialEmbeddingRequest;
import com.faceattend_edu.domain.dto.response.FacialEmbeddingResponse;
import com.faceattend_edu.domain.model.FacialEmbedding;
import com.faceattend_edu.domain.model.Person;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class FacialEmbeddingServiceMapper {

    private final PersonServiceMapper personServiceMapper;

    public FacialEmbedding toDomain(FacialEmbeddingRequest request,
                                    Person person) {
        return new FacialEmbedding(
                null,
                person,
                request.embedding(),
                request.modelVersion(),
                request.isActive(),
                request.createdAt()
        );
    }

    public FacialEmbeddingResponse toResponse(FacialEmbedding facialEmbedding) {
        return new FacialEmbeddingResponse(
                facialEmbedding.getId(),
                personServiceMapper.toResponse(facialEmbedding.getPerson()),
                facialEmbedding.getEmbedding(),
                facialEmbedding.getModelVersion(),
                facialEmbedding.getIsActive(),
                facialEmbedding.getCreatedAt()
        );
    }
}
