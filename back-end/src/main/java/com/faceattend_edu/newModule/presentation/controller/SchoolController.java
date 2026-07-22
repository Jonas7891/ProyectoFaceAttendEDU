package com.faceattend_edu.newModule.presentation.controller;

import com.faceattend_edu.newModule.application.service.SchoolService;
import com.faceattend_edu.newModule.domain.dto.patch.SchoolPatch;
import com.faceattend_edu.newModule.domain.dto.request.SchoolRequest;
import com.faceattend_edu.newModule.domain.dto.response.SchoolResponse;
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

    private final SchoolService schoolService;

    @Override
    protected AbstractService<SchoolRequest, SchoolResponse, SchoolPatch, UUID> getService() {
        return schoolService;
    }
}
