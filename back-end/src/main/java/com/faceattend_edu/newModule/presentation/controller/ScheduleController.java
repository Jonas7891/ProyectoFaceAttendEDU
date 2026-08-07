package com.faceattend_edu.newModule.presentation.controller;

import com.faceattend_edu.newModule.application.service.ScheduleService;
import com.faceattend_edu.newModule.domain.dto.patch.SchedulePatch;
import com.faceattend_edu.newModule.domain.dto.request.ScheduleRequest;
import com.faceattend_edu.newModule.domain.dto.response.ScheduleResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/api/schedules")
public class ScheduleController extends AbstractController<ScheduleResponse, ScheduleRequest, SchedulePatch, Long> {

    private final ScheduleService service;

    @Override
    protected AbstractService<ScheduleRequest, ScheduleResponse, SchedulePatch, Long> getService() {
        return service;
    }
}
