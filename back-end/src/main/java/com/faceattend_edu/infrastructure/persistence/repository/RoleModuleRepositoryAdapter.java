package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.RoleModule;
import com.faceattend_edu.domain.port.RoleModuleRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.ModuleEntity;
import com.faceattend_edu.infrastructure.persistence.entity.RoleEntity;
import com.faceattend_edu.infrastructure.persistence.entity.RoleModuleEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class RoleModuleRepositoryAdapter implements RoleModuleRepositoryPort {

    private final RoleModuleJpaRepository jpaRepository;
    private final RoleRepositoryAdapter roleRepositoryAdapter;
    private final ModuleRepositoryAdapter moduleRepositoryAdapter;


    @Override
    public RoleModule save(RoleModule roleModule) {
        RoleModuleEntity entity = toEntity(roleModule);
        RoleModuleEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<RoleModule> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<RoleModule> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

    //

    private RoleModuleEntity toEntity(RoleModule roleModule) {
        RoleModuleEntity entity = new RoleModuleEntity();

        RoleEntity role = new RoleEntity();
        role.setId(roleModule.getIdRole().getId());
        entity.setIdRole(role);

        ModuleEntity module = new ModuleEntity();
        module.setId(roleModule.getIdModule().getId());
        entity.setIdModule(module);

        return entity;
    }

    public RoleModule toDomain(RoleModuleEntity entity) {
        return new RoleModule(
                null,
                roleRepositoryAdapter.toDomain(entity.getIdRole()),
                moduleRepositoryAdapter.toDomain(entity.getIdModule())
        );
    }
}
