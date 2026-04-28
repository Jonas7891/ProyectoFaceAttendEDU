package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.Period;
import com.faceattend_edu.domain.port.PeriodRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.PeriodEntity;
import com.faceattend_edu.infrastructure.persistence.entity.SchoolEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.PeriodRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.PeriodJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class PeriodRepositoryAdapter implements PeriodRepositoryPort {

    private final PeriodJpaRepository jpaRepository;
    private final PeriodRepositoryMapper mapper;

    @Override
    public Period save(Period period) {
        PeriodEntity entity = mapper.toEntity(period);
        PeriodEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Period> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Period> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public boolean existsByName(String name) {
        return jpaRepository.existsByName(name);
    }

}
