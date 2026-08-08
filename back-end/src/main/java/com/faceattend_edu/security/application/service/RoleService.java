package com.faceattend_edu.security.application.service;

import com.faceattend_edu.security.domain.dto.patch.RolePatch;
import com.faceattend_edu.security.domain.dto.request.RoleRequest;
import com.faceattend_edu.security.domain.dto.response.RoleResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface RoleService
        extends AbstractService<RoleRequest, RoleResponse, RolePatch, Integer> {
}
