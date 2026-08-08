package com.faceattend_edu.iotDevice.presentation.controller;

import com.faceattend_edu.iotDevice.application.service.IotDeviceService;
import com.faceattend_edu.iotDevice.domain.dto.patch.IotDevicePatch;
import com.faceattend_edu.iotDevice.domain.dto.request.IotDeviceRequest;
import com.faceattend_edu.iotDevice.domain.dto.response.IotDeviceResponse;
import com.faceattend_edu.util.application.AbstractService;
import com.faceattend_edu.util.presentation.AbstractController;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@AllArgsConstructor
@RestController
@RequestMapping("/api/iot-devices")
public class IotDeviceController extends AbstractController<IotDeviceResponse, IotDeviceRequest, IotDevicePatch, UUID> {

    private final IotDeviceService service;

    @Override
    protected AbstractService<IotDeviceRequest, IotDeviceResponse, IotDevicePatch, UUID> getService() {
        return service;
    }
}
