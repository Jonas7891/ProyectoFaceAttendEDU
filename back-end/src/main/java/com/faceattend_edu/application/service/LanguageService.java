package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.LanguageRequest;
import com.faceattend_edu.domain.dto.response.LanguageResponse;

import java.util.List;

public interface LanguageService {

    LanguageResponse findById(Integer id);

    List<LanguageResponse> findAll();

    LanguageResponse save(LanguageRequest request);

    LanguageResponse update(Integer id, LanguageRequest request);

    void deleteById(Integer id);
}
