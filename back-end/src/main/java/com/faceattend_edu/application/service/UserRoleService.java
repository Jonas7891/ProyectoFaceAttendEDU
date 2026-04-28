package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.UserRoleRequest;
import com.faceattend_edu.domain.dto.response.UserRoleResponse;

import java.util.List;

public interface UserRoleService {

    UserRoleResponse findById(Integer id);

    UserRoleResponse findByUser(Integer id);

    UserRoleResponse findByRole(Integer id);

    List<UserRoleResponse> findAll();

    UserRoleResponse save(UserRoleRequest request);

    UserRoleResponse update(Integer id, UserRoleRequest request);

    void deleteById(Integer id);
}
