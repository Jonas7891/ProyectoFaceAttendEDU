package com.faceattend_edu.newModule.infrastructure.persistence.mapper;

import com.faceattend_edu.newModule.domain.model.FacialEmbedding;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.FacialEmbeddingEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FacialEmbeddingRepositoryMapper extends AbstractRepositoryMapper<FacialEmbeddingEntity, FacialEmbedding> {
}
