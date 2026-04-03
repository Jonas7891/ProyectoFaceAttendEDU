package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.Log;

import java.util.List;
import java.util.Optional;

public interface LogRepositoryPort {
    Log save(Log log);

    Optional<Log> findById(Integer id);

    List<Log> findAll();

    void deleteById(Integer id);
}
