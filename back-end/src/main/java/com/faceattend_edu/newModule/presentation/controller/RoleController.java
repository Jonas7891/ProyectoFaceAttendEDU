package com.faceattend_edu.newModule.presentation.controller;

import com.faceattend_edu.newModule.application.service.RoleService;
import com.faceattend_edu.newModule.domain.dto.patch.RolePatch;
import com.faceattend_edu.newModule.domain.dto.request.RoleRequest;
import com.faceattend_edu.newModule.domain.dto.response.RoleResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/api/roles")
public class RoleController extends AbstractController<RoleResponse, RoleRequest, RolePatch, Integer> {

    private final RoleService service;

    @Override
    protected AbstractService<RoleRequest, RoleResponse, RolePatch, Integer> getService() {
        return service;
    }
}
