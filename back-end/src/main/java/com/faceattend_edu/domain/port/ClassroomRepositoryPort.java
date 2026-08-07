package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.Classroom;

import java.util.List;
import java.util.Optional;

public interface ClassroomRepositoryPort {
    Classroom save(Classroom clasroom);

    Optional<Classroom> findById(Integer id);

    List<Classroom> findAll();

    void deleteById(Integer id);
}
