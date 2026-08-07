package com.faceattend_edu.newModule.presentation.controller;

import com.faceattend_edu.newModule.application.service.ViewService;
import com.faceattend_edu.newModule.domain.dto.patch.ViewPatch;
import com.faceattend_edu.newModule.domain.dto.request.ViewRequest;
import com.faceattend_edu.newModule.domain.dto.response.ViewResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/api/views")
public class ViewController extends AbstractController<ViewResponse, ViewRequest, ViewPatch, Integer> {

    private final ViewService service;

    @Override
    protected AbstractService<ViewRequest, ViewResponse, ViewPatch, Integer> getService() {
        return service;
    }
}
