package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.Action;
import com.faceattend_edu.domain.port.ActionRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.ActionEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.ActionRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.ActionJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class ActionRepositoryAdapter implements ActionRepositoryPort {

    private final ActionJpaRepository jpaRepository;
    private final ActionRepositoryMapper mapper;

    @Override
    public Action save(Action action) {
        ActionEntity entity = mapper.toEntity(action);
        ActionEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Action> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Action> findAll() {
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
