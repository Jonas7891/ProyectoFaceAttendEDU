package com.faceattend_edu.iotDevice.application.mapper;

import com.faceattend_edu.iotDevice.domain.dto.patch.IotDevicePatch;
import com.faceattend_edu.iotDevice.domain.dto.request.IotDeviceRequest;
import com.faceattend_edu.iotDevice.domain.dto.response.IotDeviceResponse;
import com.faceattend_edu.iotDevice.domain.model.IotDevice;
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
