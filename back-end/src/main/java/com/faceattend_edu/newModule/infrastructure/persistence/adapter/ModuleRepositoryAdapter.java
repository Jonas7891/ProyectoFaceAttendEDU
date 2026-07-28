package com.faceattend_edu.newModule.infrastructure.persistence.adapter;

import com.faceattend_edu.newModule.domain.model.Module;
import com.faceattend_edu.newModule.domain.port.ModuleRepositoryPort;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.ModuleEntity;
import com.faceattend_edu.newModule.infrastructure.persistence.mapper.ModuleRepositoryMapper;
import com.faceattend_edu.newModule.infrastructure.persistence.repository.ModuleJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
@AllArgsConstructor
public class ModuleRepositoryAdapter
        extends AbstractRepositoryAdapter<ModuleEntity, Module, Integer>
        implements ModuleRepositoryPort {

    private final ModuleJpaRepository jpaRepository;
    private final ModuleRepositoryMapper mapper;

    @Override
    protected JpaRepository<ModuleEntity, Integer> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<Module, ModuleEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<ModuleEntity, Module> toDomainMapper() {
        return mapper::toDomain;
    }
}
