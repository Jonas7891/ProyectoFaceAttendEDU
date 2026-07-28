package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.PeriodPatch;
import com.faceattend_edu.newModule.domain.dto.request.PeriodRequest;
import com.faceattend_edu.newModule.domain.dto.response.PeriodResponse;
import com.faceattend_edu.newModule.domain.model.Period;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PeriodServiceMapper
        extends AbstractServiceMapper<Period, PeriodRequest, PeriodResponse, PeriodPatch> {
}
