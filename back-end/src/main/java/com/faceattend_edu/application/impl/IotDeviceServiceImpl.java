package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.IotDeviceServiceMapper;
import com.faceattend_edu.application.service.IotDeviceService;
import com.faceattend_edu.domain.dto.request.IotDeviceRequest;
import com.faceattend_edu.domain.dto.response.IotDeviceResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.IotDevice;
import com.faceattend_edu.domain.port.IotDeviceRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class IotDeviceServiceImpl implements IotDeviceService {

    private final IotDeviceRepositoryPort repository;
    private final IotDeviceServiceMapper mapper;

    @Override
    public IotDeviceResponse findById(Integer id) {
        IotDevice iotDevice = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("IotDevice", id));
        return mapper.toResponse(iotDevice);
    }

    @Override
    public List<IotDeviceResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public IotDeviceResponse save(IotDeviceRequest request) {
        IotDevice iotDevice = mapper.toDomain(request);
        IotDevice saved = repository.save(iotDevice);
        return mapper.toResponse(saved);
    }

    @Override
    public IotDeviceResponse update(Integer id, IotDeviceRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("IotDevice", id));
        IotDevice updated = mapper.toDomain(request);
        updated.setId(id);
        IotDevice saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("IotDevice", id);
        }
        repository.deleteById(id);
    }
}
