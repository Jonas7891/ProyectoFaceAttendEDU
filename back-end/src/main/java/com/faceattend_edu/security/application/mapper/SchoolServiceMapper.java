package com.faceattend_edu.security.application.mapper;

import com.faceattend_edu.security.domain.dto.patch.SchoolPatch;
import com.faceattend_edu.security.domain.dto.request.SchoolRequest;
import com.faceattend_edu.security.domain.dto.response.SchoolResponse;
import com.faceattend_edu.security.domain.model.School;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SchoolServiceMapper
        extends AbstractServiceMapper<School, SchoolRequest, SchoolResponse, SchoolPatch> {
}
