package com.faceattend_edu.application.impl;

import com.faceattend_edu.application.mapper.PeriodServiceMapper;
import com.faceattend_edu.application.service.PeriodService;
import com.faceattend_edu.domain.dto.request.PeriodRequest;
import com.faceattend_edu.domain.dto.response.PeriodResponse;
import com.faceattend_edu.domain.exception.NotFoundException;
import com.faceattend_edu.domain.model.Period;
import com.faceattend_edu.domain.port.PeriodRepositoryPort;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class PeriodServiceImpl implements PeriodService {

    private final PeriodRepositoryPort repository;
    private final PeriodServiceMapper mapper;

    @Override
    public PeriodResponse findById(Integer id) {
        Period period = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Period", id));
        return mapper.toResponse(period);
    }

    @Override
    public List<PeriodResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public PeriodResponse save(PeriodRequest request) {
        Period period = mapper.toDomain(request);
        Period saved = repository.save(period);
        return mapper.toResponse(saved);
    }

    @Override
    public PeriodResponse update(Integer id, PeriodRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Period", id));
        Period updated = mapper.toDomain(request);
        updated.setId(id);
        Period saved = repository.save(updated);
        return mapper.toResponse(saved);
    }

    @Override
    public void deleteById(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new NotFoundException("Period", id);
        }
        repository.deleteById(id);
    }
}
