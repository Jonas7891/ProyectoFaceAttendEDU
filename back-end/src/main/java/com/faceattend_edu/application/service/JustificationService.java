package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.JustificationRequest;
import com.faceattend_edu.domain.dto.response.JustificationResponse;

import java.util.List;

public interface JustificationService {

    JustificationResponse findById(Integer id);

    List<JustificationResponse> findAll();

    JustificationResponse save(JustificationRequest request);

    JustificationResponse update(Integer id, JustificationRequest request);

    void deleteById(Integer id);
}
