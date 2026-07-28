package com.faceattend_edu.newModule.application.service;

import com.faceattend_edu.newModule.domain.dto.patch.IotDevicePatch;
import com.faceattend_edu.newModule.domain.dto.request.IotDeviceRequest;
import com.faceattend_edu.newModule.domain.dto.response.IotDeviceResponse;
import com.faceattend_edu.util.application.AbstractService;

import java.util.UUID;

public interface IotDeviceService
        extends AbstractService<IotDeviceRequest, IotDeviceResponse, IotDevicePatch, UUID> {
}
