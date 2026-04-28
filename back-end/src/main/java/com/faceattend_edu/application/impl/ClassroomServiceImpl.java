package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.ClassroomServiceMapper;
import com.faceattend_edu.application.service.ClassroomService;
import com.faceattend_edu.domain.dto.request.ClassroomRequest;
import com.faceattend_edu.domain.dto.response.ClassroomResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Classroom;
import com.faceattend_edu.domain.port.ClassroomRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class ClassroomServiceImpl implements ClassroomService {

    private final ClassroomRepositoryPort repository;
    private final ClassroomServiceMapper mapper;

    @Override
    public ClassroomResponse findById(Integer id) {
        Classroom classroom = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Classroom", id));
        return mapper.toResponse(classroom);
    }

    @Override
    public List<ClassroomResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public ClassroomResponse save(ClassroomRequest request) {
        Classroom classroom = mapper.toDomain(request);
        Classroom saved = repository.save(classroom);
        return mapper.toResponse(saved);
    }

    @Override
    public ClassroomResponse update(Integer id, ClassroomRequest request) {
        Classroom existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Classroom", id));
        Classroom updated = mapper.toDomain(request);
        updated.setId(id);
        Classroom saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Classroom", id);
        }
        repository.deleteById(id);
    }
}
