package com.faceattend_edu.newModule.presentation.controller;

import com.faceattend_edu.newModule.application.service.JustificationService;
import com.faceattend_edu.newModule.domain.dto.patch.JustificationPatch;
import com.faceattend_edu.newModule.domain.dto.request.JustificationRequest;
import com.faceattend_edu.newModule.domain.dto.response.JustificationResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/api/justifications")
public class JustificationController extends AbstractController<JustificationResponse, JustificationRequest, JustificationPatch, Long> {

    private final JustificationService service;

    @Override
    protected AbstractService<JustificationRequest, JustificationResponse, JustificationPatch, Long> getService() {
        return service;
    }
}
