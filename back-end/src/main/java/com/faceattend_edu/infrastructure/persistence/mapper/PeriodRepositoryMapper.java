package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.Period;
import com.faceattend_edu.infrastructure.persistence.entity.PeriodEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PeriodRepositoryMapper {

    PeriodEntity toEntity(Period period);

    Period toDomain(PeriodEntity entity);
}
