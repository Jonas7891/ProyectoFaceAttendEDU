package com.faceattend_edu.academic.application.service;

import com.faceattend_edu.academic.domain.dto.patch.EnrollmentPatch;
import com.faceattend_edu.academic.domain.dto.request.EnrollmentRequest;
import com.faceattend_edu.academic.domain.dto.response.EnrollmentResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface EnrollmentService
        extends AbstractService<EnrollmentRequest, EnrollmentResponse, EnrollmentPatch, Long> {
}
