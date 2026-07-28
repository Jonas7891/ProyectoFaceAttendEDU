package com.faceattend_edu.newModule.infrastructure.persistence.adapter;

import com.faceattend_edu.newModule.domain.model.View;
import com.faceattend_edu.newModule.domain.port.ViewRepositoryPort;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.ViewEntity;
import com.faceattend_edu.newModule.infrastructure.persistence.mapper.ViewRepositoryMapper;
import com.faceattend_edu.newModule.infrastructure.persistence.repository.ViewJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
@AllArgsConstructor
public class ViewRepositoryAdapter
        extends AbstractRepositoryAdapter<ViewEntity, View, Integer>
        implements ViewRepositoryPort {

    private final ViewJpaRepository jpaRepository;
    private final ViewRepositoryMapper mapper;

    @Override
    protected JpaRepository<ViewEntity, Integer> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<View, ViewEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<ViewEntity, View> toDomainMapper() {
        return mapper::toDomain;
    }
}
