package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.IotDeviceServiceMapper;
import com.faceattend_edu.application.service.IotDeviceService;
import com.faceattend_edu.domain.dto.request.IotDeviceRequest;
import com.faceattend_edu.domain.dto.response.IotDeviceResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Classroom;
import com.faceattend_edu.domain.model.IotDevice;
import com.faceattend_edu.domain.model.Person;
import com.faceattend_edu.domain.port.ClassroomRepositoryPort;
import com.faceattend_edu.domain.port.IotDeviceRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
public class IotDeviceServiceImpl implements IotDeviceService {

    private final IotDeviceRepositoryPort repository;
    private final IotDeviceServiceMapper mapper;

    private final ClassroomRepositoryPort classroomRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public IotDeviceResponse findById(Integer id) {
        IotDevice iotDevice = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("IotDevice", id));
        return mapper.toResponse(iotDevice);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IotDeviceResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public IotDeviceResponse save(IotDeviceRequest request) {
        Classroom classroom = classroomRepositoryPort.findById(request.classroomId())
                .orElseThrow(() -> new NotFoundException("Classroom", request.classroomId()));

        IotDevice iotDevice = mapper.toDomain(request, classroom);
        IotDevice saved = repository.save(iotDevice);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public IotDeviceResponse update(Integer id, IotDeviceRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("IotDevice", id));
        Classroom classroom = classroomRepositoryPort.findById(request.classroomId())
                .orElseThrow(() -> new NotFoundException("Classroom", request.classroomId()));

        IotDevice updated = mapper.toDomain(request, classroom);
        updated.setId(id);
        IotDevice saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("IotDevice", id);
        }
        repository.deleteById(id);
    }
}
