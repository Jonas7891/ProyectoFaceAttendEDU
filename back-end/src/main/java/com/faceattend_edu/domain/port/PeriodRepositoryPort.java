package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.Period;

import java.util.List;
import java.util.Optional;

public interface PeriodRepositoryPort {
    Period save(Period period);

    Optional<Period> findById(Integer id);

    List<Period> findAll();

    void deleteById(Integer id);

    boolean existsByName(String name);
}
