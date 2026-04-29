package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.Log;
import com.faceattend_edu.domain.port.LogRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.LogEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.LogRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.LogJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class LogRepositoryAdapter implements LogRepositoryPort {

    private final LogJpaRepository jpaRepository;
    private final LogRepositoryMapper mapper;

    @Override
    public Log save(Log log) {
        LogEntity entity = mapper.toEntity(log);
        LogEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Log> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Log> findAll() {
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
