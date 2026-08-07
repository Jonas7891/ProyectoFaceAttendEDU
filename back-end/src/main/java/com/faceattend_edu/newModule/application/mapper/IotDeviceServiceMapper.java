package com.faceattend_edu.newModule.application.mapper;

import com.faceattend_edu.newModule.domain.dto.patch.IotDevicePatch;
import com.faceattend_edu.newModule.domain.dto.request.IotDeviceRequest;
import com.faceattend_edu.newModule.domain.dto.response.IotDeviceResponse;
import com.faceattend_edu.newModule.domain.model.IotDevice;
import com.faceattend_edu.util.application.AbstractServiceMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface IotDeviceServiceMapper
        extends AbstractServiceMapper<IotDevice, IotDeviceRequest, IotDeviceResponse, IotDevicePatch> {

    @Override
    @Mapping(source = "classroomId", target = "classroom.id")
    IotDevice toDomain(IotDeviceRequest iotDeviceRequest);
}
