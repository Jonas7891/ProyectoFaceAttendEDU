package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.ModuleRequest;
import com.faceattend_edu.domain.dto.response.ModuleResponse;

import java.util.List;

public interface ModuleService {

    ModuleResponse findById(Integer id);

    List<ModuleResponse> findAll();

    ModuleResponse save(ModuleRequest request);

    ModuleResponse update(Integer id, ModuleRequest request);

    void deleteById(Integer id);
}
