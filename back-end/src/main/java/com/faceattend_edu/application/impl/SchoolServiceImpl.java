package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.SchoolServiceMapper;
import com.faceattend_edu.application.service.SchoolService;
import com.faceattend_edu.domain.dto.request.SchoolRequest;
import com.faceattend_edu.domain.dto.response.SchoolResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.School;
import com.faceattend_edu.domain.port.SchoolRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class SchoolServiceImpl implements SchoolService {

    private final SchoolRepositoryPort repository;
    private final SchoolServiceMapper mapper;

    @Override
    public SchoolResponse findById(Integer id) {
        School school = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("School", id));
        return mapper.toResponse(school);
    }

    @Override
    public List<SchoolResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public SchoolResponse save(SchoolRequest request) {
        School school = mapper.toDomain(request);
        School saved = repository.save(school);
        return mapper.toResponse(saved);
    }

    @Override
    public SchoolResponse update(Integer id, SchoolRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("School", id));
        School updated = mapper.toDomain(request);
        updated.setId(id);
        School saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("School", id);
        }
        repository.deleteById(id);
    }
}
