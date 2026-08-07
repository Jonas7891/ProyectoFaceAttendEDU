package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.PeriodPatch;
import com.faceattend_edu.newModule.domain.dto.request.PeriodRequest;
import com.faceattend_edu.newModule.domain.dto.response.PeriodResponse;
import com.faceattend_edu.newModule.domain.model.Period;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PeriodServiceMapper
        extends AbstractServiceMapper<Period, PeriodRequest, PeriodResponse, PeriodPatch> {

    @Override
    @Mapping(source = "schoolId", target = "school.id")
    Period toDomain(PeriodRequest periodRequest);
}
