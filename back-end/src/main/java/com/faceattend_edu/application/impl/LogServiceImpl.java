package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.LogServiceMapper;
import com.faceattend_edu.application.service.LogService;
import com.faceattend_edu.domain.dto.request.LogRequest;
import com.faceattend_edu.domain.dto.response.LogResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Log;
import com.faceattend_edu.domain.port.LogRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class LogServiceImpl implements LogService {

    private final LogRepositoryPort repository;
    private final LogServiceMapper mapper;

    @Override
    public LogResponse findById(Integer id) {
        Log log = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Log", id));
        return mapper.toResponse(log);
    }

    @Override
    public List<LogResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public LogResponse save(LogRequest request) {
        Log log = mapper.toDomain(request);
        Log saved = repository.save(log);
        return mapper.toResponse(saved);
    }

    @Override
    public LogResponse update(Integer id, LogRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Log", id));
        Log updated = mapper.toDomain(request);
        updated.setId(id);
        Log saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Log", id);
        }
        repository.deleteById(id);
    }
}
