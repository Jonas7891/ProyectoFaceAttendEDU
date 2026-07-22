package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.SchoolPatch;
import com.faceattend_edu.newModule.domain.dto.request.SchoolRequest;
import com.faceattend_edu.newModule.domain.dto.response.SchoolResponse;
import com.faceattend_edu.newModule.domain.model.School;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface SchoolServiceMapper {

    School toDomain(SchoolRequest request);

    SchoolResponse toResponse(School school);

    // @Mapping(target = "idSchool", ignore = true)
    // @Mapping(target = "status", ignore = true)
    void updateDomain(@MappingTarget School existing, SchoolRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(@MappingTarget School existing, SchoolPatch patch);
}
