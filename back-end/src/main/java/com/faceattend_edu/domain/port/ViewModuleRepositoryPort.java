package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.ViewModule;

import java.util.List;
import java.util.Optional;

public interface ViewModuleRepositoryPort {
    ViewModule save(ViewModule viewModule);

    Optional<ViewModule> findById(Integer id);

    List<ViewModule> findAll();

    void deleteById(Integer id);
}
