package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.Action;
import com.faceattend_edu.domain.port.ActionRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.ActionEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class ActionRepositoryAdapter implements ActionRepositoryPort {

    private final ActionJpaRepository jpaRepository;

    @Override
    public Action save(Action action) {
        ActionEntity entity = toEntity(action);
        ActionEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Action> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Action> findAll() {
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

    private ActionEntity toEntity(Action action) {
        ActionEntity entity = new ActionEntity();

        entity.setId(action.getId());
        entity.setName(action.getName());
        entity.setDescription(action.getDescription());
        entity.setHttpMethod(action.getHttpMethod());
        entity.setEnabled(action.getEnabled());

        return entity;
    }

    public Action toDomain(ActionEntity entity) {
        return new Action(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getHttpMethod(),
                entity.getEnabled()
        );
    }
}
