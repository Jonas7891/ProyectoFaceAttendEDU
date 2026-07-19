package com.faceattend_edu.util.domain;

import java.util.List;
import java.util.Optional;

public interface AbstractRepositoryPort<Model, ID> {
    Model save(Model model);

    Optional<Model> findById(ID id);

    boolean existsById(ID id);

    List<Model> findAll();

    void deleteById(ID id);
}
