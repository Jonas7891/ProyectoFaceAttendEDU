package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.View;

import java.util.List;
import java.util.Optional;

public interface ViewRepositoryPort {
    View save(View view);

    Optional<View> findById(Integer id);

    List<View> findAll();

    void deleteById(Integer id);

    boolean existsByName(String name);
}
