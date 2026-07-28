package com.faceattend_edu.newModule.application.service;

import com.faceattend_edu.newModule.domain.dto.patch.JustificationPatch;
import com.faceattend_edu.newModule.domain.dto.request.JustificationRequest;
import com.faceattend_edu.newModule.domain.dto.response.JustificationResponse;
import com.faceattend_edu.util.application.AbstractService;

import java.util.UUID;

public interface JustificationService
        extends AbstractService<JustificationRequest, JustificationResponse, JustificationPatch, Long> {
}
