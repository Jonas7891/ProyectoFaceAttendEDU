package com.faceattend_edu.academic.infrastructure.persistence.mapper;

import com.faceattend_edu.academic.domain.model.Period;
import com.faceattend_edu.academic.infrastructure.persistence.entity.PeriodEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PeriodRepositoryMapper extends AbstractRepositoryMapper<PeriodEntity, Period> {
}
