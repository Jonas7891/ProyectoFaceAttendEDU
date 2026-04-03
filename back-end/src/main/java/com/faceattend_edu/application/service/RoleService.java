package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.RoleRequest;
import com.faceattend_edu.domain.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {

    RoleResponse findById(Integer id);

    List<RoleResponse> findAll();

    RoleResponse save(RoleRequest request);

    RoleResponse update(Integer id, RoleRequest request);

    void deleteById(Integer id);
}
