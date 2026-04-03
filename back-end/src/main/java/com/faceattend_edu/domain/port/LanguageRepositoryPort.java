package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.Language;

import java.util.List;
import java.util.Optional;

public interface LanguageRepositoryPort {
    Language save(Language language);

    Optional<Language> findById(Integer id);

    List<Language> findAll();

    void deleteById(Integer id);
}
