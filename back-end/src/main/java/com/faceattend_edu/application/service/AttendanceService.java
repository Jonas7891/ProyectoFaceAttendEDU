package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.AttendanceRequest;
import com.faceattend_edu.domain.dto.response.AttendanceResponse;

import java.util.List;

public interface AttendanceService {

    AttendanceResponse findById(Integer id);

    List<AttendanceResponse> findAll();

    AttendanceResponse save(AttendanceRequest request);

    AttendanceResponse update(Integer id, AttendanceRequest request);

    void deleteById(Integer id);
}
