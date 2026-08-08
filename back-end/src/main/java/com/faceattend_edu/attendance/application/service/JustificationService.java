package com.faceattend_edu.attendance.application.service;

import com.faceattend_edu.attendance.domain.dto.patch.JustificationPatch;
import com.faceattend_edu.attendance.domain.dto.request.JustificationRequest;
import com.faceattend_edu.attendance.domain.dto.response.JustificationResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface JustificationService
        extends AbstractService<JustificationRequest, JustificationResponse, JustificationPatch, Long> {
}
