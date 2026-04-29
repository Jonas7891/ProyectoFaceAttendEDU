package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.dto.request.PeriodRequest;
import com.faceattend_edu.domain.dto.response.PeriodResponse;
import com.faceattend_edu.domain.model.Period;
import com.faceattend_edu.infrastructure.persistence.entity.PeriodEntity;
import com.faceattend_edu.infrastructure.persistence.entity.SchoolEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface PeriodRepositoryMapper {

    PeriodEntity toEntity(Period period);

    Period toDomain(PeriodEntity entity);
}
