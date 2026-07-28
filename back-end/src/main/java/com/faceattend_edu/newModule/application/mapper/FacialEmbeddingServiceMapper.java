package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.FacialEmbeddingPatch;
import com.faceattend_edu.newModule.domain.dto.request.FacialEmbeddingRequest;
import com.faceattend_edu.newModule.domain.dto.response.FacialEmbeddingResponse;
import com.faceattend_edu.newModule.domain.model.FacialEmbedding;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FacialEmbeddingServiceMapper
        extends AbstractServiceMapper<FacialEmbedding, FacialEmbeddingRequest, FacialEmbeddingResponse, FacialEmbeddingPatch> {
}
