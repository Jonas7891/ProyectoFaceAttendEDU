package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.Action;

import java.util.List;
import java.util.Optional;

public interface ActionRepositoryPort {
    Action save(Action action);

    Optional<Action> findById(Integer id);

    List<Action> findAll();

    void deleteById(Integer id);

    boolean existsByName(String name);
}
