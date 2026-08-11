package com.faceattend_edu.attendance.presentation.controller;

import com.faceattend_edu.attendance.application.service.AttendanceService;
import com.faceattend_edu.attendance.domain.dto.patch.AttendancePatch;
import com.faceattend_edu.attendance.domain.dto.request.AttendanceRequest;
import com.faceattend_edu.attendance.domain.dto.response.AttendanceResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/api/attendances")
public class AttendanceController extends AbstractController<AttendanceResponse, AttendanceRequest, AttendancePatch, Long> {

    private final AttendanceService service;

    @Override
    protected AbstractService<AttendanceRequest, AttendanceResponse, AttendancePatch, Long> getService() {
        return service;
    }
}
