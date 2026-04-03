package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.FacialEmbedding;

import java.util.List;
import java.util.Optional;

public interface FacialEmbeddingRepositoryPort {
    FacialEmbedding save(FacialEmbedding facialEmbedding);

    Optional<FacialEmbedding> findById(Integer id);

    List<FacialEmbedding> findAll();

    void deleteById(Integer id);
}
