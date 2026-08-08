package com.faceattend_edu.configuration.presentation.controller;

import com.faceattend_edu.configuration.application.service.FacialEmbeddingService;
import com.faceattend_edu.configuration.domain.dto.patch.FacialEmbeddingPatch;
import com.faceattend_edu.configuration.domain.dto.request.FacialEmbeddingRequest;
import com.faceattend_edu.configuration.domain.dto.response.FacialEmbeddingResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@AllArgsConstructor
@RestController
@RequestMapping("/api/facial-embeddings")
public class FacialEmbeddingController extends AbstractController<FacialEmbeddingResponse, FacialEmbeddingRequest, FacialEmbeddingPatch, UUID> {

    private final FacialEmbeddingService service;

    @Override
    protected AbstractService<FacialEmbeddingRequest, FacialEmbeddingResponse, FacialEmbeddingPatch, UUID> getService() {
        return service;
    }
}
