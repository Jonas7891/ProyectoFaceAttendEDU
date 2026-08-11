package com.faceattend_edu.security.application.service;

import com.faceattend_edu.security.domain.dto.patch.ModulePatch;
import com.faceattend_edu.security.domain.dto.request.ModuleRequest;
import com.faceattend_edu.security.domain.dto.response.ModuleResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface ModuleService
        extends AbstractService<ModuleRequest, ModuleResponse, ModulePatch, Integer> {
}
