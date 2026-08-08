package com.faceattend_edu.academic.presentation.controller;

import com.faceattend_edu.academic.application.service.PeriodService;
import com.faceattend_edu.academic.domain.dto.patch.PeriodPatch;
import com.faceattend_edu.academic.domain.dto.request.PeriodRequest;
import com.faceattend_edu.academic.domain.dto.response.PeriodResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/api/periods")
public class PeriodController extends AbstractController<PeriodResponse, PeriodRequest, PeriodPatch, Integer> {

    private final PeriodService service;

    @Override
    protected AbstractService<PeriodRequest, PeriodResponse, PeriodPatch, Integer> getService() {
        return service;
    }
}
