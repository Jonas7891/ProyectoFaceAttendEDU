package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.FacialEmbeddingRequest;
import com.faceattend_edu.domain.dto.response.FacialEmbeddingResponse;

import java.util.List;

public interface FacialEmbeddingService {

    FacialEmbeddingResponse findById(Integer id);

    List<FacialEmbeddingResponse> findAll();

    FacialEmbeddingResponse save(FacialEmbeddingRequest request);

    FacialEmbeddingResponse update(Integer id, FacialEmbeddingRequest request);

    void deleteById(Integer id);
}
