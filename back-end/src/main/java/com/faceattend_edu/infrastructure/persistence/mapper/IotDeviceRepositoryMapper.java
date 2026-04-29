package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.dto.request.IotDeviceRequest;
import com.faceattend_edu.domain.dto.response.IotDeviceResponse;
import com.faceattend_edu.domain.model.IotDevice;
import com.faceattend_edu.infrastructure.persistence.entity.ClassroomEntity;
import com.faceattend_edu.infrastructure.persistence.entity.IotDeviceEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface IotDeviceRepositoryMapper {

    IotDeviceEntity toEntity(IotDevice iotDevice);

    IotDevice toDomain(IotDeviceEntity entity);
}
