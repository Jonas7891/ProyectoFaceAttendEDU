package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.AttendanceServiceMapper;
import com.faceattend_edu.application.service.AttendanceService;
import com.faceattend_edu.domain.dto.request.AttendanceRequest;
import com.faceattend_edu.domain.dto.response.AttendanceResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Attendance;
import com.faceattend_edu.domain.model.IotDevice;
import com.faceattend_edu.domain.model.Person;
import com.faceattend_edu.domain.model.Schedule;
import com.faceattend_edu.domain.port.AttendanceRepositoryPort;
import com.faceattend_edu.domain.port.IotDeviceRepositoryPort;
import com.faceattend_edu.domain.port.PersonRepositoryPort;
import com.faceattend_edu.domain.port.ScheduleRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepositoryPort repository;
    private final AttendanceServiceMapper mapper;

    private final PersonRepositoryPort personRepositoryPort;
    private final ScheduleRepositoryPort scheduleRepositoryPort;
    private final IotDeviceRepositoryPort iotDeviceRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse findById(Integer id) {
        Attendance attendance = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Attendance", id));
        return mapper.toResponse(attendance);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse save(AttendanceRequest request) {
        Person student = personRepositoryPort.findById(request.studentId())
                .orElseThrow(() -> new NotFoundException("Person", request.studentId()));
        Schedule schedule = scheduleRepositoryPort.findById(request.scheduleId())
                .orElseThrow(() -> new NotFoundException("Schedule", request.scheduleId()));
        IotDevice iotDevice = iotDeviceRepositoryPort.findById(request.iotDeviceId())
                .orElseThrow(() -> new NotFoundException("IotDevice", request.iotDeviceId()));

        Attendance attendance = mapper.toDomain(request, student, schedule, iotDevice);
        Attendance saved = repository.save(attendance);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse update(Integer id, AttendanceRequest request) {
        Attendance existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Attendance", id));
        Person student = personRepositoryPort.findById(request.studentId())
                .orElseThrow(() -> new NotFoundException("Person", request.studentId()));
        Schedule schedule = scheduleRepositoryPort.findById(request.scheduleId())
                .orElseThrow(() -> new NotFoundException("Schedule", request.scheduleId()));
        IotDevice iotDevice = iotDeviceRepositoryPort.findById(request.iotDeviceId())
                .orElseThrow(() -> new NotFoundException("IotDevice", request.iotDeviceId()));

        Attendance updated = mapper.toDomain(request, student, schedule, iotDevice);
        updated.setId(id);
        Attendance saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Attendance", id);
        }
        repository.deleteById(id);
    }
}
