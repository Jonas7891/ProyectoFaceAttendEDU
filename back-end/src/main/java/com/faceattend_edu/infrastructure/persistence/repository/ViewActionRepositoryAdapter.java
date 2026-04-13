package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.ViewAction;
import com.faceattend_edu.domain.port.ViewActionRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.ActionEntity;
import com.faceattend_edu.infrastructure.persistence.entity.ViewActionEntity;
import com.faceattend_edu.infrastructure.persistence.entity.ViewEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class ViewActionRepositoryAdapter implements ViewActionRepositoryPort {

    private final ViewActionJpaRepository jpaRepository;
    private final ViewRepositoryAdapter viewRepositoryAdapter;
    private final ActionRepositoryAdapter actionRepositoryAdapter;

    @Override
    public ViewAction save(ViewAction viewAction) {
        ViewActionEntity entity = toEntity(viewAction);
        ViewActionEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<ViewAction> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<ViewAction> findAll() {
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

    private ViewActionEntity toEntity(ViewAction viewAction) {
        ViewActionEntity entity = new ViewActionEntity();

        ViewEntity view = new ViewEntity();
        view.setId(viewAction.getIdView().getId());
        entity.setIdView(view);

        ActionEntity action = new ActionEntity();
        action.setId(viewAction.getIdAction().getId());
        entity.setIdAction(action);

        return entity;
    }

    public ViewAction toDomain(ViewActionEntity entity) {
        return new ViewAction(
                null,
                viewRepositoryAdapter.toDomain(entity.getIdView()),
                actionRepositoryAdapter.toDomain(entity.getIdAction())
        );
    }
}
