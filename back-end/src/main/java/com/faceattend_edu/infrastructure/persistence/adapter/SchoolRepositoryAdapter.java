package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.School;
import com.faceattend_edu.domain.port.SchoolRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.SchoolEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.SchoolRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.SchoolJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class SchoolRepositoryAdapter implements SchoolRepositoryPort {

    private final SchoolJpaRepository jpaRepository;
    private final SchoolRepositoryMapper mapper;

    @Override
    public School save(School school) {
        SchoolEntity entity = mapper.toEntity(school);
        SchoolEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<School> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<School> findAll() {
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
