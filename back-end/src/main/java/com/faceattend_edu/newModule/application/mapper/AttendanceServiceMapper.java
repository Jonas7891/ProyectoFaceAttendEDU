package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.AttendancePatch;
import com.faceattend_edu.newModule.domain.dto.request.AttendanceRequest;
import com.faceattend_edu.newModule.domain.dto.response.AttendanceResponse;
import com.faceattend_edu.newModule.domain.model.Attendance;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AttendanceServiceMapper
        extends AbstractServiceMapper<Attendance, AttendanceRequest, AttendanceResponse, AttendancePatch> {
}
