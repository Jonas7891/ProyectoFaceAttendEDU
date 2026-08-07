package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.PeriodRequest;
import com.faceattend_edu.domain.dto.response.PeriodResponse;

import java.util.List;

public interface PeriodService {

    PeriodResponse findById(Integer id);

    List<PeriodResponse> findAll();

    PeriodResponse save(PeriodRequest request);

    PeriodResponse update(Integer id, PeriodRequest request);

    void deleteById(Integer id);
}
