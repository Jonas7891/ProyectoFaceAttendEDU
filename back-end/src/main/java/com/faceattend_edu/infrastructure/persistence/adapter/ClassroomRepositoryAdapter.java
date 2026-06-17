package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.Classroom;
import com.faceattend_edu.domain.port.ClassroomRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.ClassroomEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.ClassroomRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.ClassroomJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class ClassroomRepositoryAdapter implements ClassroomRepositoryPort {

    private final ClassroomJpaRepository jpaRepository;
    private final ClassroomRepositoryMapper mapper;

    @Override
    public Classroom save(Classroom classroom) {
        ClassroomEntity entity = mapper.toEntity(classroom);
        ClassroomEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Classroom> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Classroom> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

}
