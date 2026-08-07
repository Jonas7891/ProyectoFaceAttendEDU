package com.faceattend_edu.newModule.application.service;

import com.faceattend_edu.newModule.domain.dto.patch.RolePatch;
import com.faceattend_edu.newModule.domain.dto.request.RoleRequest;
import com.faceattend_edu.newModule.domain.dto.response.RoleResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface RoleService
        extends AbstractService<RoleRequest, RoleResponse, RolePatch, Integer> {
}
