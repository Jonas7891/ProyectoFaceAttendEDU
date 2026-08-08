package com.faceattend_edu.security.infrastructure.persistence.adapter;

import com.faceattend_edu.security.domain.model.Action;
import com.faceattend_edu.security.domain.port.ActionRepositoryPort;
import com.faceattend_edu.security.infrastructure.persistence.entity.ActionEntity;
import com.faceattend_edu.security.infrastructure.persistence.mapper.ActionRepositoryMapper;
import com.faceattend_edu.security.infrastructure.persistence.repository.ActionJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
@AllArgsConstructor
public class ActionRepositoryAdapter
        extends AbstractRepositoryAdapter<ActionEntity, Action, Integer>
        implements ActionRepositoryPort {

    private final ActionJpaRepository jpaRepository;
    private final ActionRepositoryMapper mapper;

    @Override
    protected JpaRepository<ActionEntity, Integer> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<Action, ActionEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<ActionEntity, Action> toDomainMapper() {
        return mapper::toDomain;
    }
}
