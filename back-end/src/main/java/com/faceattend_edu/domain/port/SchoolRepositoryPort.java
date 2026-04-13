package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.School;

import java.util.List;
import java.util.Optional;

public interface SchoolRepositoryPort {
    School save(School school);

    Optional<School> findById(Integer id);

    List<School> findAll();

    void deleteById(Integer id);

    boolean existsByName(String name);
}
