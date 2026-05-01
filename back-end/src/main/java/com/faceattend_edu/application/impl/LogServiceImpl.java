package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.LogServiceMapper;
import com.faceattend_edu.application.service.LogService;
import com.faceattend_edu.domain.dto.request.LogRequest;
import com.faceattend_edu.domain.dto.response.LogResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Attendance;
import com.faceattend_edu.domain.model.Classroom;
import com.faceattend_edu.domain.model.Log;
import com.faceattend_edu.domain.model.User;
import com.faceattend_edu.domain.port.AttendanceRepositoryPort;
import com.faceattend_edu.domain.port.LogRepositoryPort;
import com.faceattend_edu.domain.port.UserRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
public class LogServiceImpl implements LogService {

    private final LogRepositoryPort repository;
    private final LogServiceMapper mapper;

    private final UserRepositoryPort userRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public LogResponse findById(Integer id) {
        Log log = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Log", id));
        return mapper.toResponse(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LogResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LogResponse save(LogRequest request) {
        User user = userRepositoryPort.findById(request.userId())
                .orElseThrow(() -> new NotFoundException("User", request.userId()));

        Log log = mapper.toDomain(request, user);
        Log saved = repository.save(log);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public LogResponse update(Integer id, LogRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Log", id));
        User user = userRepositoryPort.findById(request.userId())
                .orElseThrow(() -> new NotFoundException("User", request.userId()));

        Log updated = mapper.toDomain(request, user);
        updated.setId(id);
        Log saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Log", id);
        }
        repository.deleteById(id);
    }
}
