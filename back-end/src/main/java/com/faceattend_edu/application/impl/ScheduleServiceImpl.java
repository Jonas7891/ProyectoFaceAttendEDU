package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.ScheduleServiceMapper;
import com.faceattend_edu.application.service.ScheduleService;
import com.faceattend_edu.domain.dto.request.ScheduleRequest;
import com.faceattend_edu.domain.dto.response.ScheduleResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Schedule;
import com.faceattend_edu.domain.port.ScheduleRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepositoryPort repository;
    private final ScheduleServiceMapper mapper;

    @Override
    public ScheduleResponse findById(Integer id) {
        Schedule schedule = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Schedule", id));
        return mapper.toResponse(schedule);
    }

    @Override
    public List<ScheduleResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public ScheduleResponse save(ScheduleRequest request) {
        Schedule schedule = mapper.toDomain(request);
        Schedule saved = repository.save(schedule);
        return mapper.toResponse(saved);
    }

    @Override
    public ScheduleResponse update(Integer id, ScheduleRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Schedule", id));
        Schedule updated = mapper.toDomain(request);
        updated.setId(id);
        Schedule saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Schedule", id);
        }
        repository.deleteById(id);
    }
}
