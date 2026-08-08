package com.faceattend_edu.configuration.application.mapper;

import com.faceattend_edu.configuration.domain.dto.patch.FacialEmbeddingPatch;
import com.faceattend_edu.configuration.domain.dto.request.FacialEmbeddingRequest;
import com.faceattend_edu.configuration.domain.dto.response.FacialEmbeddingResponse;
import com.faceattend_edu.configuration.domain.model.FacialEmbedding;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FacialEmbeddingServiceMapper
        extends AbstractServiceMapper<FacialEmbedding, FacialEmbeddingRequest, FacialEmbeddingResponse, FacialEmbeddingPatch> {

    @Override
    @Mapping(source = "personId", target = "person.id")
    FacialEmbedding toDomain(FacialEmbeddingRequest facialEmbeddingRequest);
}
