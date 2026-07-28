package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.JustificationPatch;
import com.faceattend_edu.newModule.domain.dto.request.JustificationRequest;
import com.faceattend_edu.newModule.domain.dto.response.JustificationResponse;
import com.faceattend_edu.newModule.domain.model.Justification;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface JustificationServiceMapper
        extends AbstractServiceMapper<Justification, JustificationRequest, JustificationResponse, JustificationPatch> {
}
