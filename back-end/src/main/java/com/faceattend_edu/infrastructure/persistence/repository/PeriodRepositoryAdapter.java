package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.Period;
import com.faceattend_edu.domain.port.PeriodRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.PeriodEntity;
import com.faceattend_edu.infrastructure.persistence.entity.SchoolEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class PeriodRepositoryAdapter implements PeriodRepositoryPort {

    private PeriodJpaRepository jpaRepository;
    private SchoolRepositoryAdapter schoolRepositoryAdapter;

    @Override
    public Period save(Period period) {
        PeriodEntity entity = toEntity(period);
        PeriodEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Period> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Period> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(this::toDomain)
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

    //

    private PeriodEntity toEntity(Period period) {
        PeriodEntity entity = new PeriodEntity();
        entity.setId(period.getId());

        SchoolEntity school = new SchoolEntity();
        school.setId(period.getIdSchool().getId());
        entity.setIdSchool(school);

        entity.setName(period.getName());
        entity.setStartDate(period.getStartDate());
        entity.setEndDate(period.getEndDate());
        entity.setIsActive(period.getIsActive());
        return entity;
    }

    public Period toDomain(PeriodEntity entity) {
        return new Period(
                entity.getId(),
                schoolRepositoryAdapter.toDomain(entity.getIdSchool()),
                entity.getName(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getIsActive()
        );
    }
}
