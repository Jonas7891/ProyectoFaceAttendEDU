package com.faceattend_edu.iotDevice.infrastructure.persistence.mapper;

import com.faceattend_edu.iotDevice.domain.model.IotDevice;
import com.faceattend_edu.iotDevice.infrastructure.persistence.entity.IotDeviceEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface IotDeviceRepositoryMapper extends AbstractRepositoryMapper<IotDeviceEntity, IotDevice> {
}
