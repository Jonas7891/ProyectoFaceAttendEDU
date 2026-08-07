package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.FacialEmbedding;
import com.faceattend_edu.infrastructure.persistence.entity.FacialEmbeddingEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FacialEmbeddingRepositoryMapper {

    FacialEmbeddingEntity toEntity(FacialEmbedding facialEmbedding);

    FacialEmbedding toDomain(FacialEmbeddingEntity entity);
}
