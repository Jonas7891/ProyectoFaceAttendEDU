package com.faceattend_edu.newModule.infrastructure.persistence.mapper;

import com.faceattend_edu.newModule.domain.model.Schedule;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.ScheduleEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ScheduleRepositoryMapper extends AbstractRepositoryMapper<ScheduleEntity, Schedule> {
}
