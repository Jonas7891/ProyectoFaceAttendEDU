package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.Module;
import com.faceattend_edu.domain.port.ModuleRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.ModuleEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class ModuleRepositoryAdapter implements ModuleRepositoryPort {

    private final ModuleJpaRepository jpaRepository;


    @Override
    public Module save(Module module) {
        ModuleEntity entity = toEntity(module);
        ModuleEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Module> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Module> findAll() {
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

    private ModuleEntity toEntity(Module module) {
        ModuleEntity entity = new ModuleEntity();
        entity.setId(module.getId());
        entity.setName(module.getName());
        entity.setDescription(module.getDescription());
        entity.setIcon(module.getIcon());
        entity.setOrder(module.getOrder());
        return entity;
    }

    public Module toDomain(ModuleEntity entity) {
        return new Module(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getIcon(),
                entity.getOrder()
        );
    }
}
