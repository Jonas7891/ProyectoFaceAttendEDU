package com.faceattend_edu.newModule.application.impl;

import com.faceattend_edu.newModule.application.mapper.ActionServiceMapper;
import com.faceattend_edu.newModule.application.mapper.AttendanceServiceMapper;
import com.faceattend_edu.newModule.application.service.AttendanceService;
import com.faceattend_edu.newModule.domain.dto.patch.AttendancePatch;
import com.faceattend_edu.newModule.domain.dto.request.AttendanceRequest;
import com.faceattend_edu.newModule.domain.dto.response.AttendanceResponse;
import com.faceattend_edu.newModule.domain.model.Attendance;
import com.faceattend_edu.newModule.domain.port.ActionRepositoryPort;
import com.faceattend_edu.newModule.domain.port.AttendanceRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class AttendanceServiceImpl
        extends AbstractServiceImpl<Attendance, AttendanceResponse, AttendanceRequest, AttendancePatch, Long>
        implements AttendanceService {

    private final AttendanceRepositoryPort repository;
    private final AttendanceServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<Attendance, Long> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "Attendance";
    }

    @Override
    protected Function<AttendanceRequest, Attendance> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<Attendance, AttendanceResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<Attendance, AttendanceRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<Attendance, AttendancePatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<Attendance, Boolean> setStatus() {
        return Attendance::setStatus;
    }
}
