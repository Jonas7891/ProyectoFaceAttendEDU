package com.faceattend_edu.academic.presentation.controller;

import com.faceattend_edu.academic.application.service.EnrollmentService;
import com.faceattend_edu.academic.domain.dto.patch.EnrollmentPatch;
import com.faceattend_edu.academic.domain.dto.request.EnrollmentRequest;
import com.faceattend_edu.academic.domain.dto.response.EnrollmentResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController extends AbstractController<EnrollmentResponse, EnrollmentRequest, EnrollmentPatch, Long> {

    private final EnrollmentService service;

    @Override
    protected AbstractService<EnrollmentRequest, EnrollmentResponse, EnrollmentPatch, Long> getService() {
        return service;
    }
}
