package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.View;
import com.faceattend_edu.domain.port.ViewRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.ViewEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class ViewRepositoryAdapter implements ViewRepositoryPort {

    private final ViewJpaRepository jpaRepository;


    @Override
    public View save(View view) {
        ViewEntity entity = toEntity(view);
        ViewEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<View> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<View> findAll() {
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

    private ViewEntity toEntity(View view) {
        ViewEntity entity = new ViewEntity();
        entity.setId(view.getId());
        entity.setName(view.getName());
        entity.setRoute(view.getRoute());
        entity.setTitle(view.getTitle());
        entity.setIsPublic(view.getIsPublic());
        return entity;
    }

    public View toDomain(ViewEntity entity) {
        return new View(
                entity.getId(),
                entity.getName(),
                entity.getRoute(),
                entity.getTitle(),
                entity.getIsPublic()
        );
    }
}
