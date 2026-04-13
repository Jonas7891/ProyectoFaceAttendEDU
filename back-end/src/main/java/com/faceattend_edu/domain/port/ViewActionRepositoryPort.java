package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.ViewAction;

import java.util.List;
import java.util.Optional;

public interface ViewActionRepositoryPort {
    ViewAction save(ViewAction viewAction);

    Optional<ViewAction> findById(Integer id);

    List<ViewAction> findAll();

    void deleteById(Integer id);
}
