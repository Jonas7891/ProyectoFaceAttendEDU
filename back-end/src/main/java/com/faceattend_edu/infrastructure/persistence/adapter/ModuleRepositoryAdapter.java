package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.Module;
import com.faceattend_edu.domain.port.ModuleRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.ModuleEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.ModuleRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.ModuleJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class ModuleRepositoryAdapter implements ModuleRepositoryPort {

    private final ModuleJpaRepository jpaRepository;
    private final ModuleRepositoryMapper mapper;

    @Override
    public Module save(Module module) {
        ModuleEntity entity = mapper.toEntity(module);
        ModuleEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Module> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Module> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<Module> findAllById(List<Integer> ids) {
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
