package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.JustificationServiceMapper;
import com.faceattend_edu.application.service.JustificationService;
import com.faceattend_edu.domain.dto.request.JustificationRequest;
import com.faceattend_edu.domain.dto.response.JustificationResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Attendance;
import com.faceattend_edu.domain.model.Justification;
import com.faceattend_edu.domain.model.User;
import com.faceattend_edu.domain.port.AttendanceRepositoryPort;
import com.faceattend_edu.domain.port.JustificationRepositoryPort;
import com.faceattend_edu.domain.port.UserRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
public class JustificationServiceImpl implements JustificationService {

    private final JustificationRepositoryPort repository;
    private final JustificationServiceMapper mapper;

    private final AttendanceRepositoryPort attendanceRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public JustificationResponse findById(Integer id) {
        Justification justification = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Justification", id));
        return mapper.toResponse(justification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JustificationResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JustificationResponse save(JustificationRequest request) {
        Attendance attendance = attendanceRepositoryPort.findById(request.attendanceId())
                .orElseThrow(() -> new NotFoundException("Attendance", request.attendanceId()));
        User reviewedBy = userRepositoryPort.findById(request.reviewedBy())
                .orElseThrow(() -> new NotFoundException("ReviewedBy", request.reviewedBy()));

        Justification justification = mapper.toDomain(request, attendance, reviewedBy);
        Justification saved = repository.save(justification);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public JustificationResponse update(Integer id, JustificationRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Justification", id));
        Attendance attendance = attendanceRepositoryPort.findById(request.attendanceId())
                .orElseThrow(() -> new NotFoundException("Attendance", request.attendanceId()));
        User reviewedBy = userRepositoryPort.findById(request.reviewedBy())
                .orElseThrow(() -> new NotFoundException("ReviewedBy", request.reviewedBy()));

        Justification updated = mapper.toDomain(request, attendance, reviewedBy);
        updated.setId(id);
        Justification saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Justification", id);
        }
        repository.deleteById(id);
    }
}
