package com.faceattend_edu.newModule.presentation.controller;

import com.faceattend_edu.newModule.application.service.ModuleService;
import com.faceattend_edu.newModule.domain.dto.patch.ModulePatch;
import com.faceattend_edu.newModule.domain.dto.request.ModuleRequest;
import com.faceattend_edu.newModule.domain.dto.response.ModuleResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/api/modules")
public class ModuleController extends AbstractController<ModuleResponse, ModuleRequest, ModulePatch, Integer> {

    private final ModuleService service;

    @Override
    protected AbstractService<ModuleRequest, ModuleResponse, ModulePatch, Integer> getService() {
        return service;
    }
}
