package com.faceattend_edu.iotDevice.application.service;

import com.faceattend_edu.iotDevice.domain.dto.patch.IotDevicePatch;
import com.faceattend_edu.iotDevice.domain.dto.request.IotDeviceRequest;
import com.faceattend_edu.iotDevice.domain.dto.response.IotDeviceResponse;
import com.faceattend_edu.util.application.AbstractService;

import java.util.UUID;

public interface IotDeviceService
        extends AbstractService<IotDeviceRequest, IotDeviceResponse, IotDevicePatch, UUID> {
}
