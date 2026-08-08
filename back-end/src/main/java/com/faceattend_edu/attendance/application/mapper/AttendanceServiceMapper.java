package com.faceattend_edu.attendance.application.mapper;

import com.faceattend_edu.attendance.domain.dto.patch.AttendancePatch;
import com.faceattend_edu.attendance.domain.dto.request.AttendanceRequest;
import com.faceattend_edu.attendance.domain.dto.response.AttendanceResponse;
import com.faceattend_edu.attendance.domain.model.Attendance;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AttendanceServiceMapper
        extends AbstractServiceMapper<Attendance, AttendanceRequest, AttendanceResponse, AttendancePatch> {

    @Override
    @Mapping(source = "studentId", target = "student.id")
    @Mapping(source = "scheduleId", target = "schedule.id")
    @Mapping(source = "deviceId", target = "device.id")
    Attendance toDomain(AttendanceRequest request);
}
