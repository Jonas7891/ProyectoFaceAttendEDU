package com.faceattend_edu.newModule.application.service;

import com.faceattend_edu.newModule.domain.dto.patch.ViewPatch;
import com.faceattend_edu.newModule.domain.dto.request.ViewRequest;
import com.faceattend_edu.newModule.domain.dto.response.ViewResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface ViewService
        extends AbstractService<ViewRequest, ViewResponse, ViewPatch, Integer> {
}
