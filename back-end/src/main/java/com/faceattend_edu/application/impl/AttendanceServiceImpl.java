package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.AttendanceMapper;
import com.faceattend_edu.application.service.AttendanceService;
import com.faceattend_edu.domain.dto.request.AttendanceRequest;
import com.faceattend_edu.domain.dto.response.AttendanceResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Attendance;
import com.faceattend_edu.domain.port.AttendanceRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepositoryPort repository;
    private final AttendanceMapper mapper;

    @Override
    public AttendanceResponse findById(Integer id) {
        Attendance attendance = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Attendance", id));
        return mapper.toResponse(attendance);
    }

    @Override
    public List<AttendanceResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public AttendanceResponse save(AttendanceRequest request) {
        Attendance attendance = mapper.toDomain(request);
        Attendance saved = repository.save(attendance);
        return mapper.toResponse(saved);
    }

    @Override
    public AttendanceResponse update(Integer id, AttendanceRequest request) {
        Attendance existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Attendance", id));
        Attendance updated = mapper.toDomain(request);
        updated.setId(id);
        Attendance saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (!repository.findById(id).isPresent()) {
            throw new NotFoundException("Attendance", id);
        }
        repository.deleteById(id);
    }
}
