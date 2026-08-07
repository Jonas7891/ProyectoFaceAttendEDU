package com.faceattend_edu.newModule.application.service;

import com.faceattend_edu.newModule.domain.dto.patch.FacialEmbeddingPatch;
import com.faceattend_edu.newModule.domain.dto.request.FacialEmbeddingRequest;
import com.faceattend_edu.newModule.domain.dto.response.FacialEmbeddingResponse;
import com.faceattend_edu.util.application.AbstractService;

import java.util.UUID;

public interface FacialEmbeddingService
        extends AbstractService<FacialEmbeddingRequest, FacialEmbeddingResponse, FacialEmbeddingPatch, UUID> {
}
