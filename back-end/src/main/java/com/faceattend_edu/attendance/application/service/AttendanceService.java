package com.faceattend_edu.attendance.application.service;

import com.faceattend_edu.attendance.domain.dto.patch.AttendancePatch;
import com.faceattend_edu.attendance.domain.dto.request.AttendanceRequest;
import com.faceattend_edu.attendance.domain.dto.response.AttendanceResponse;
import com.faceattend_edu.util.application.AbstractService;

public interface AttendanceService
        extends AbstractService<AttendanceRequest, AttendanceResponse, AttendancePatch, Long> {
}
