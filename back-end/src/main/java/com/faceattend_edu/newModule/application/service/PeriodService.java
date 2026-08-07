package com.faceattend_edu.newModule.application.service;

import com.faceattend_edu.newModule.domain.dto.patch.PeriodPatch;
import com.faceattend_edu.newModule.domain.dto.request.PeriodRequest;
import com.faceattend_edu.newModule.domain.dto.response.PeriodResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface PeriodService
        extends AbstractService<PeriodRequest, PeriodResponse, PeriodPatch, Integer> {
}
