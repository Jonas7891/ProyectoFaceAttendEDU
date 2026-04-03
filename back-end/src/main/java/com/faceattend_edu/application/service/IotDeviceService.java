package com.faceattend_edu.application.service;

import com.faceattend_edu.domain.dto.request.IotDeviceRequest;
import com.faceattend_edu.domain.dto.response.IotDeviceResponse;

import java.util.List;

public interface IotDeviceService {

    IotDeviceResponse findById(Integer id);

    List<IotDeviceResponse> findAll();

    IotDeviceResponse save(IotDeviceRequest request);

    IotDeviceResponse update(Integer id, IotDeviceRequest request);

    void deleteById(Integer id);
}
