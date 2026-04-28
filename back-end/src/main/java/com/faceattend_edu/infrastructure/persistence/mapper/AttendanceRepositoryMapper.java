package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.dto.request.AttendanceRequest;
import com.faceattend_edu.domain.dto.response.AttendanceResponse;
import com.faceattend_edu.domain.model.Attendance;
import com.faceattend_edu.infrastructure.persistence.adapter.IotDeviceRepositoryAdapter;
import com.faceattend_edu.infrastructure.persistence.adapter.PersonRepositoryAdapter;
import com.faceattend_edu.infrastructure.persistence.adapter.ScheduleRepositoryAdapter;
import com.faceattend_edu.infrastructure.persistence.entity.AttendanceEntity;
import com.faceattend_edu.infrastructure.persistence.entity.IotDeviceEntity;
import com.faceattend_edu.infrastructure.persistence.entity.PersonEntity;
import com.faceattend_edu.infrastructure.persistence.entity.ScheduleEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface AttendanceRepositoryMapper {

    AttendanceEntity toEntity(Attendance attendance);

    Attendance toDomain(AttendanceEntity entity);
}
