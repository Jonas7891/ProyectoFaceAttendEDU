package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.View;
import com.faceattend_edu.domain.port.ViewRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.ViewEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.ViewRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.ViewJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class ViewRepositoryAdapter implements ViewRepositoryPort {

    private final ViewJpaRepository jpaRepository;
    private final ViewRepositoryMapper mapper;

    @Override
    public View save(View view) {
        ViewEntity entity = mapper.toEntity(view);
        ViewEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<View> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<View> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<View> findAllById(List<Integer> ids) {
        return jpaRepository.findAllById(ids)
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
