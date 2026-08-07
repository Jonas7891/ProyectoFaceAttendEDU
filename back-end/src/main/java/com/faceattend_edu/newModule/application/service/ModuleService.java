package com.faceattend_edu.newModule.application.service;

import com.faceattend_edu.newModule.domain.dto.patch.ModulePatch;
import com.faceattend_edu.newModule.domain.dto.request.ModuleRequest;
import com.faceattend_edu.newModule.domain.dto.response.ModuleResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface ModuleService
        extends AbstractService<ModuleRequest, ModuleResponse, ModulePatch, Integer> {
}
