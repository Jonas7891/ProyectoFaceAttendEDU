package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.dto.request.FacialEmbeddingRequest;
import com.faceattend_edu.domain.dto.response.FacialEmbeddingResponse;
import com.faceattend_edu.domain.model.FacialEmbedding;
import com.faceattend_edu.infrastructure.persistence.entity.FacialEmbeddingEntity;
import com.faceattend_edu.infrastructure.persistence.entity.PersonEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface FacialEmbeddingRepositoryMapper {

    FacialEmbeddingEntity toEntity(FacialEmbedding facialEmbedding);

    FacialEmbedding toDomain(FacialEmbeddingEntity entity);
}
