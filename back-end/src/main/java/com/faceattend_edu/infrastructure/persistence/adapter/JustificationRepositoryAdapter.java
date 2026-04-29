package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.Justification;
import com.faceattend_edu.domain.port.JustificationRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.AttendanceEntity;
import com.faceattend_edu.infrastructure.persistence.entity.JustificationEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.JustificationRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.JustificationJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class JustificationRepositoryAdapter implements JustificationRepositoryPort {

    private final JustificationJpaRepository jpaRepository;
    private final JustificationRepositoryMapper mapper;

    @Override
    public Justification save(Justification justification) {
        JustificationEntity entity = mapper.toEntity(justification);
        JustificationEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Justification> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Justification> findAll() {
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
