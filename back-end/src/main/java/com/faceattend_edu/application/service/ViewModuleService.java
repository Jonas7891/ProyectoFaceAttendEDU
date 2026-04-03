package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.ViewModuleRequest;
import com.faceattend_edu.domain.dto.response.ViewModuleResponse;

import java.util.List;

public interface ViewModuleService {

    ViewModuleResponse findById(Integer id);

    List<ViewModuleResponse> findAll();

    ViewModuleResponse save(ViewModuleRequest request);

    ViewModuleResponse update(Integer id, ViewModuleRequest request);

    void deleteById(Integer id);
}
