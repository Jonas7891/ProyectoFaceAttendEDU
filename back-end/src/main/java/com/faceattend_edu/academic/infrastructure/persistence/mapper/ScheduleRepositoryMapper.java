package com.faceattend_edu.academic.infrastructure.persistence.mapper;

import com.faceattend_edu.academic.domain.model.Schedule;
import com.faceattend_edu.academic.infrastructure.persistence.entity.ScheduleEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ScheduleRepositoryMapper extends AbstractRepositoryMapper<ScheduleEntity, Schedule> {
}
