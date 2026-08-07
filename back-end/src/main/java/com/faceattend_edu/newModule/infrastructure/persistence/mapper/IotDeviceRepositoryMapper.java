package com.faceattend_edu.newModule.infrastructure.persistence.mapper;

import com.faceattend_edu.newModule.domain.model.IotDevice;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.IotDeviceEntity;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface IotDeviceRepositoryMapper extends AbstractRepositoryMapper<IotDeviceEntity, IotDevice> {
}
