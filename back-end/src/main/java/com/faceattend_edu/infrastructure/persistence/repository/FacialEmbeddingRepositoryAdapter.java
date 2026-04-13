package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.FacialEmbedding;
import com.faceattend_edu.domain.port.FacialEmbeddingRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.FacialEmbeddingEntity;
import com.faceattend_edu.infrastructure.persistence.entity.PersonEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class FacialEmbeddingRepositoryAdapter implements FacialEmbeddingRepositoryPort {

    private final FacialEmbeddingJpaRepository jpaRepository;
    private final PersonRepositoryAdapter personRepositoryAdapter;

    @Override
    public FacialEmbedding save(FacialEmbedding facialEmbedding) {
        FacialEmbeddingEntity entity = toEntity(facialEmbedding);
        FacialEmbeddingEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<FacialEmbedding> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<FacialEmbedding> findAll() {
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

    private FacialEmbeddingEntity toEntity(FacialEmbedding facialEmbedding) {
        FacialEmbeddingEntity entity = new FacialEmbeddingEntity();
        entity.setId(facialEmbedding.getId());

        PersonEntity person = new PersonEntity();
        person.setId(facialEmbedding.getIdPerson().getId());
        entity.setIdPerson(person);

        entity.setEmbedding(facialEmbedding.getEmbedding());
        entity.setModelVersion(facialEmbedding.getModelVersion());
        entity.setIsActive(facialEmbedding.getIsActive());
        entity.setCreatedAt(facialEmbedding.getCreatedAt());
        return entity;
    }

    public FacialEmbedding toDomain(FacialEmbeddingEntity entity) {
        return new FacialEmbedding(
                entity.getId(),
                personRepositoryAdapter.toDomain(entity.getIdPerson()),
                entity.getEmbedding(),
                entity.getModelVersion(),
                entity.getIsActive(),
                entity.getCreatedAt()
        );
    }
}
