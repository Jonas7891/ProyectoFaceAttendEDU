package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.EnrollmentRequest;
import com.faceattend_edu.domain.dto.response.EnrollmentResponse;

import java.util.List;

public interface EnrollmentService {

    EnrollmentResponse findById(Integer id);

    List<EnrollmentResponse> findAll();

    EnrollmentResponse save(EnrollmentRequest request);

    EnrollmentResponse update(Integer id, EnrollmentRequest request);

    void deleteById(Integer id);
}
