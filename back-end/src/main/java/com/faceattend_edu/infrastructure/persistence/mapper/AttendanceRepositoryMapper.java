package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.Attendance;
import com.faceattend_edu.infrastructure.persistence.entity.AttendanceEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AttendanceRepositoryMapper {

    AttendanceEntity toEntity(Attendance attendance);

    Attendance toDomain(AttendanceEntity entity);
}
