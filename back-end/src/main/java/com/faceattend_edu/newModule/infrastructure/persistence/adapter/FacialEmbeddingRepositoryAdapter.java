package com.faceattend_edu.newModule.infrastructure.persistence.adapter;

import com.faceattend_edu.newModule.domain.model.FacialEmbedding;
import com.faceattend_edu.newModule.domain.port.FacialEmbeddingRepositoryPort;
import com.faceattend_edu.newModule.infrastructure.persistence.entity.FacialEmbeddingEntity;
import com.faceattend_edu.newModule.infrastructure.persistence.mapper.FacialEmbeddingRepositoryMapper;
import com.faceattend_edu.newModule.infrastructure.persistence.repository.FacialEmbeddingJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.function.Function;

@Component
@AllArgsConstructor
public class FacialEmbeddingRepositoryAdapter
        extends AbstractRepositoryAdapter<FacialEmbeddingEntity, FacialEmbedding, UUID>
        implements FacialEmbeddingRepositoryPort {

    private final FacialEmbeddingJpaRepository jpaRepository;
    private final FacialEmbeddingRepositoryMapper mapper;

    @Override
    protected JpaRepository<FacialEmbeddingEntity, UUID> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<FacialEmbedding, FacialEmbeddingEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<FacialEmbeddingEntity, FacialEmbedding> toDomainMapper() {
        return mapper::toDomain;
    }
}
