package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.ScheduleRequest;
import com.faceattend_edu.domain.dto.response.ScheduleResponse;

import java.util.List;

public interface ScheduleService {

    ScheduleResponse findById(Integer id);

    List<ScheduleResponse> findAll();

    ScheduleResponse save(ScheduleRequest request);

    ScheduleResponse update(Integer id, ScheduleRequest request);

    void deleteById(Integer id);
}
