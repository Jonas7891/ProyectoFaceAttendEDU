package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.Enrollment;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepositoryPort {
    Enrollment save(Enrollment enrollment);

    Optional<Enrollment> findById(Integer id);

    List<Enrollment> findAll();

    void deleteById(Integer id);
}
