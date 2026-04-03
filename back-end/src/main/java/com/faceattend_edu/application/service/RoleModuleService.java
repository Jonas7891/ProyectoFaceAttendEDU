package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.RoleModuleRequest;
import com.faceattend_edu.domain.dto.response.RoleModuleResponse;

import java.util.List;

public interface RoleModuleService {

    RoleModuleResponse findById(Integer id);

    List<RoleModuleResponse> findAll();

    RoleModuleResponse save(RoleModuleRequest request);

    RoleModuleResponse update(Integer id, RoleModuleRequest request);

    void deleteById(Integer id);
}
