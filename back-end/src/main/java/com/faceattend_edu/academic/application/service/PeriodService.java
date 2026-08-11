package com.faceattend_edu.academic.application.service;

import com.faceattend_edu.academic.domain.dto.patch.PeriodPatch;
import com.faceattend_edu.academic.domain.dto.request.PeriodRequest;
import com.faceattend_edu.academic.domain.dto.response.PeriodResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface PeriodService
        extends AbstractService<PeriodRequest, PeriodResponse, PeriodPatch, Integer> {
}
