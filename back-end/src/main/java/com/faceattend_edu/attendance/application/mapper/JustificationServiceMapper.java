package com.faceattend_edu.attendance.application.mapper;

import com.faceattend_edu.attendance.domain.dto.patch.JustificationPatch;
import com.faceattend_edu.attendance.domain.dto.request.JustificationRequest;
import com.faceattend_edu.attendance.domain.dto.response.JustificationResponse;
import com.faceattend_edu.attendance.domain.model.Justification;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface JustificationServiceMapper
        extends AbstractServiceMapper<Justification, JustificationRequest, JustificationResponse, JustificationPatch> {

    @Override
    @Mapping(source = "attendanceId", target = "attendance.id")
    Justification toDomain(JustificationRequest justificationRequest);
}
