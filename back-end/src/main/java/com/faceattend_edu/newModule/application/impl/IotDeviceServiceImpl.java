package com.faceattend_edu.newModule.application.impl;

import com.faceattend_edu.newModule.application.mapper.ActionServiceMapper;
import com.faceattend_edu.newModule.application.mapper.IotDeviceServiceMapper;
import com.faceattend_edu.newModule.application.service.IotDeviceService;
import com.faceattend_edu.newModule.domain.dto.patch.IotDevicePatch;
import com.faceattend_edu.newModule.domain.dto.request.IotDeviceRequest;
import com.faceattend_edu.newModule.domain.dto.response.IotDeviceResponse;
import com.faceattend_edu.newModule.domain.model.IotDevice;
import com.faceattend_edu.newModule.domain.port.ActionRepositoryPort;
import com.faceattend_edu.newModule.domain.port.IotDeviceRepositoryPort;
import com.faceattend_edu.util.application.AbstractServiceImpl;
import com.faceattend_edu.util.domain.AbstractRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.function.BiConsumer;
import java.util.function.Function;

@AllArgsConstructor
@Service
public class IotDeviceServiceImpl
        extends AbstractServiceImpl<IotDevice, IotDeviceResponse, IotDeviceRequest, IotDevicePatch, UUID>
        implements IotDeviceService {

    private final IotDeviceRepositoryPort repository;
    private final IotDeviceServiceMapper mapper;

    @Override
    protected AbstractRepositoryPort<IotDevice, UUID> getRepository() {
        return repository;
    }

    @Override
    protected String getEntityName() {
        return "IotDevice";
    }

    @Override
    protected Function<IotDeviceRequest, IotDevice> toDomainMapper() {
        return mapper::toDomain;
    }

    @Override
    protected Function<IotDevice, IotDeviceResponse> toResponseMapper() {
        return mapper::toResponse;
    }

    @Override
    protected BiConsumer<IotDevice, IotDeviceRequest> updateMerger() {
        return mapper::updateDomain;
    }

    @Override
    protected BiConsumer<IotDevice, IotDevicePatch> partialUpdate() {
        return mapper::partialUpdate;
    }

    @Override
    protected BiConsumer<IotDevice, Boolean> setStatus() {
        return IotDevice::setStatus;
    }
}
