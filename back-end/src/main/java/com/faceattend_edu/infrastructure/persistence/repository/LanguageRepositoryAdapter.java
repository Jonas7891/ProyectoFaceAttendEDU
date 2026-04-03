package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.Language;
import com.faceattend_edu.domain.port.LanguageRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.LanguageEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class LanguageRepositoryAdapter implements LanguageRepositoryPort {

    private final LanguageJpaRepository jpaRepository;


    @Override
    public Language save(Language language) {
        LanguageEntity entity = toEntity(language);
        LanguageEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Language> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Language> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

    //

    private LanguageEntity toEntity(Language language) {
        LanguageEntity entity = new LanguageEntity();
        entity.setId(language.getId());
        entity.setLanguageName(language.getLanguageName());
        return entity;
    }

    public Language toDomain(LanguageEntity entity) {
        return new Language(
                entity.getId(),
                entity.getLanguageName()
        );
    }
}
