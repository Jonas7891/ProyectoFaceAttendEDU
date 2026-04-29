package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.dto.request.ScheduleRequest;
import com.faceattend_edu.domain.dto.response.ScheduleResponse;
import com.faceattend_edu.domain.model.Schedule;
import com.faceattend_edu.infrastructure.persistence.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface ScheduleRepositoryMapper {

    ScheduleEntity toEntity(Schedule schedule);

    Schedule toDomain(ScheduleEntity entity);
}
