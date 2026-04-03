package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.LogRequest;
import com.faceattend_edu.domain.dto.response.LogResponse;

import java.util.List;

public interface LogService {

    LogResponse findById(Integer id);

    List<LogResponse> findAll();

    LogResponse save(LogRequest request);

    LogResponse update(Integer id, LogRequest request);

    void deleteById(Integer id);
}
