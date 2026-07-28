package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.SchoolPatch;
import com.faceattend_edu.newModule.domain.dto.request.SchoolRequest;
import com.faceattend_edu.newModule.domain.dto.response.SchoolResponse;
import com.faceattend_edu.newModule.domain.model.School;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface SchoolServiceMapper
        extends AbstractServiceMapper<School, SchoolRequest, SchoolResponse, SchoolPatch> {
}
