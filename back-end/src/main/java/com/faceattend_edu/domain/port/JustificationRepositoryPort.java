package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.Justification;

import java.util.List;
import java.util.Optional;

public interface JustificationRepositoryPort {
    Justification save(Justification justification);

    Optional<Justification> findById(Integer id);

    List<Justification> findAll();

    void deleteById(Integer id);
}
