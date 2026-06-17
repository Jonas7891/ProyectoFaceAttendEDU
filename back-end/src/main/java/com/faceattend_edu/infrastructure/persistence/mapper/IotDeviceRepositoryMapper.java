package com.faceattend_edu.infrastructure.persistence.mapper;

import com.faceattend_edu.domain.model.IotDevice;
import com.faceattend_edu.infrastructure.persistence.entity.IotDeviceEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface IotDeviceRepositoryMapper {

    IotDeviceEntity toEntity(IotDevice iotDevice);

    IotDevice toDomain(IotDeviceEntity entity);
}
