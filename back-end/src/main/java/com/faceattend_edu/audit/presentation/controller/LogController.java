package com.faceattend_edu.audit.presentation.controller;

import com.faceattend_edu.audit.application.service.LogService;
import com.faceattend_edu.audit.domain.dto.patch.LogPatch;
import com.faceattend_edu.audit.domain.dto.request.LogRequest;
import com.faceattend_edu.audit.domain.dto.response.LogResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/api/logs")
public class LogController extends AbstractController<LogResponse, LogRequest, LogPatch, Long> {

    private final LogService service;

    @Override
    protected AbstractService<LogRequest, LogResponse, LogPatch, Long> getService() {
        return service;
    }
}
