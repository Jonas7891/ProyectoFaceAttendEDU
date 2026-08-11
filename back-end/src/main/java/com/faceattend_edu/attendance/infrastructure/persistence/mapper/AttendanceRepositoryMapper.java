package com.faceattend_edu.attendance.infrastructure.persistence.mapper;

import com.faceattend_edu.attendance.domain.model.Attendance;
import com.faceattend_edu.attendance.infrastructure.persistence.entity.AttendanceEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AttendanceRepositoryMapper extends AbstractRepositoryMapper<AttendanceEntity, Attendance> {
}
