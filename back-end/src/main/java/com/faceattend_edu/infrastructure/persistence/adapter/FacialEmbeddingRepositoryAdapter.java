package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.FacialEmbedding;
import com.faceattend_edu.domain.port.FacialEmbeddingRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.FacialEmbeddingEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.FacialEmbeddingRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.FacialEmbeddingJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class FacialEmbeddingRepositoryAdapter implements FacialEmbeddingRepositoryPort {

    private final FacialEmbeddingJpaRepository jpaRepository;
    private final FacialEmbeddingRepositoryMapper mapper;

    @Override
    public FacialEmbedding save(FacialEmbedding facialEmbedding) {
        FacialEmbeddingEntity entity = mapper.toEntity(facialEmbedding);
        FacialEmbeddingEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<FacialEmbedding> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<FacialEmbedding> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

}
