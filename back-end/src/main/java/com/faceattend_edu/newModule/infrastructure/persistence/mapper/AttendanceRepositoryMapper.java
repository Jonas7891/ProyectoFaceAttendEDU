package com.faceattend_edu.newModule.infrastructure.persistence.mapper;

import com.faceattend_edu.newModule.domain.model.Attendance;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.AttendanceEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AttendanceRepositoryMapper extends AbstractRepositoryMapper<AttendanceEntity, Attendance> {
}
