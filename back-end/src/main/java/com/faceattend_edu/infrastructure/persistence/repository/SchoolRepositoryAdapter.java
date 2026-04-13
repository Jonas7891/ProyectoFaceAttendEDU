package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.School;
import com.faceattend_edu.domain.port.SchoolRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.SchoolEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class SchoolRepositoryAdapter implements SchoolRepositoryPort {

    private final SchoolJpaRepository jpaRepository;


    @Override
    public School save(School school) {
        SchoolEntity entity = toEntity(school);
        SchoolEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<School> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<School> findAll() {
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

    private SchoolEntity toEntity(School school) {
        SchoolEntity entity = new SchoolEntity();
        entity.setId(school.getId());
        entity.setName(school.getName());
        entity.setNit(school.getNit());
        entity.setAddress(school.getAddress());
        entity.setPhone(school.getPhone());
        entity.setEmail(school.getEmail());
        entity.setStatus(school.getStatus());
        entity.setCreatedAt(school.getCreatedAt());
        entity.setUpdatedAt(school.getUpdatedAt());
        return entity;
    }

    public School toDomain(SchoolEntity entity) {
        return new School(
                entity.getId(),
                entity.getName(),
                entity.getNit(),
                entity.getAddress(),
                entity.getPhone(),
                entity.getEmail(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
