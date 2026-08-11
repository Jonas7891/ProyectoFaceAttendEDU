package com.faceattend_edu.security.application.service;

import com.faceattend_edu.security.domain.dto.patch.ActionPatch;
import com.faceattend_edu.security.domain.dto.request.ActionRequest;
import com.faceattend_edu.security.domain.dto.response.ActionResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface ActionService
        extends AbstractService<ActionRequest, ActionResponse, ActionPatch, Integer> {
}
