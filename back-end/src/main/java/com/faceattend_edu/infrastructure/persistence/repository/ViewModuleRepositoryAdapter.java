package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.ViewModule;
import com.faceattend_edu.domain.port.ViewModuleRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.ModuleEntity;
import com.faceattend_edu.infrastructure.persistence.entity.ViewEntity;
import com.faceattend_edu.infrastructure.persistence.entity.ViewModuleEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class ViewModuleRepositoryAdapter implements ViewModuleRepositoryPort {

    private final ViewModuleJpaRepository jpaRepository;
    private final ViewRepositoryAdapter viewRepositoryAdapter;
    private final ModuleRepositoryAdapter moduleRepositoryAdapter;

    @Override
    public ViewModule save(ViewModule viewModule) {
        ViewModuleEntity entity = toEntity(viewModule);
        ViewModuleEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<ViewModule> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<ViewModule> findAll() {
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

    private ViewModuleEntity toEntity(ViewModule viewModule) {
        ViewModuleEntity entity = new ViewModuleEntity();

        ViewEntity view = new ViewEntity();
        view.setId(viewModule.getIdView().getId());
        entity.setIdView(view);

        ModuleEntity module = new ModuleEntity();
        module.setId(viewModule.getIdModule().getId());
        entity.setIdModule(module);

        return entity;
    }

    public ViewModule toDomain(ViewModuleEntity entity) {
        return new ViewModule(
                null,
                viewRepositoryAdapter.toDomain(entity.getIdView()),
                moduleRepositoryAdapter.toDomain(entity.getIdModule())
        );
    }
}
