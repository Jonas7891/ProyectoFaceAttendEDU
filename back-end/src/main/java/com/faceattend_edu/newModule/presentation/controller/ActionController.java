package com.faceattend_edu.newModule.presentation.controller;

import com.faceattend_edu.newModule.application.service.ActionService;
import com.faceattend_edu.newModule.application.service.SchoolService;
import com.faceattend_edu.newModule.domain.dto.patch.ActionPatch;
import com.faceattend_edu.newModule.domain.dto.request.ActionRequest;
import com.faceattend_edu.newModule.domain.dto.response.ActionResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/api/actions")
public class ActionController extends AbstractController<ActionResponse, ActionRequest, ActionPatch, Integer> {

    private final ActionService service;

    @Override
    protected AbstractService<ActionRequest, ActionResponse, ActionPatch, Integer> getService() {
        return service;
    }
}
