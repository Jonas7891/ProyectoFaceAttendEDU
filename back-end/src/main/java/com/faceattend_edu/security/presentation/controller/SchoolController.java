package com.faceattend_edu.security.presentation.controller;

import com.faceattend_edu.security.application.service.SchoolService;
import com.faceattend_edu.security.domain.dto.patch.SchoolPatch;
import com.faceattend_edu.security.domain.dto.request.SchoolRequest;
import com.faceattend_edu.security.domain.dto.response.SchoolResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@AllArgsConstructor
@RestController
@RequestMapping("/api/schools")
public class SchoolController extends AbstractController<SchoolResponse, SchoolRequest, SchoolPatch, UUID> {

    private final SchoolService service;

    @Override
    protected AbstractService<SchoolRequest, SchoolResponse, SchoolPatch, UUID> getService() {
        return service;
    }
}
