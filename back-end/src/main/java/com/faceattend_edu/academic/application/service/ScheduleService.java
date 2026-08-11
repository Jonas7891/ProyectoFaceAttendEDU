package com.faceattend_edu.academic.application.service;

import com.faceattend_edu.academic.domain.dto.patch.SchedulePatch;
import com.faceattend_edu.academic.domain.dto.request.ScheduleRequest;
import com.faceattend_edu.academic.domain.dto.response.ScheduleResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface ScheduleService extends AbstractService<ScheduleRequest, ScheduleResponse, SchedulePatch, Long> {
}
