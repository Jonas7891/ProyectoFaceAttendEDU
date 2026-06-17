package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.Schedule;
import com.faceattend_edu.infrastructure.persistence.entity.ScheduleEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ScheduleRepositoryMapper {

    ScheduleEntity toEntity(Schedule schedule);

    Schedule toDomain(ScheduleEntity entity);
}
