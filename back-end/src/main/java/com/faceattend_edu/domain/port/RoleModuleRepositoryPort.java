package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.RoleModule;

import java.util.List;
import java.util.Optional;

public interface RoleModuleRepositoryPort {
    RoleModule save(RoleModule roleModule);

    Optional<RoleModule> findById(Integer id);

    List<RoleModule> findAll();

    void deleteById(Integer id);
}
