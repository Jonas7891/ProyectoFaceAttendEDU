package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.Module;

import java.util.List;
import java.util.Optional;

public interface ModuleRepositoryPort {
    Module save(Module module);

    Optional<Module> findById(Integer id);

    List<Module> findAll();

    void deleteById(Integer id);

    boolean existsByName(String name);
}
