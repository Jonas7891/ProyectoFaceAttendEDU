package com.faceattend_edu.newModule.application.service;

import com.faceattend_edu.newModule.domain.dto.patch.AttendancePatch;
import com.faceattend_edu.newModule.domain.dto.request.AttendanceRequest;
import com.faceattend_edu.newModule.domain.dto.response.AttendanceResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface AttendanceService
        extends AbstractService<AttendanceRequest, AttendanceResponse, AttendancePatch, Long> {
}
