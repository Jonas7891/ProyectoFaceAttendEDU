package com.faceattend_edu.configuration.application.service;

import com.faceattend_edu.configuration.domain.dto.patch.FacialEmbeddingPatch;
import com.faceattend_edu.configuration.domain.dto.request.FacialEmbeddingRequest;
import com.faceattend_edu.configuration.domain.dto.response.FacialEmbeddingResponse;
import com.faceattend_edu.util.application.AbstractService;

import java.util.UUID;

public interface FacialEmbeddingService
        extends AbstractService<FacialEmbeddingRequest, FacialEmbeddingResponse, FacialEmbeddingPatch, UUID> {
}
