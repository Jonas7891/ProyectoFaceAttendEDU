package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.User;
import com.faceattend_edu.domain.port.UserRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.LanguageEntity;
import com.faceattend_edu.infrastructure.persistence.entity.PersonEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class UserRepositoryAdapter implements UserRepositoryPort {

    private final UserJpaRepository jpaRepository;
    private final PersonRepositoryAdapter personRepositoryAdapter;
    private final LanguageRepositoryAdapter languageRepositoryAdapter;


    @Override
    public User save(User user) {
        UserEntity entity = toEntity(user);
        UserEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<User> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<User> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public boolean existsByUsername(String username) {
        return jpaRepository.existsByUsername(username);
    }

    //

    private UserEntity toEntity(User user) {
        UserEntity entity = new UserEntity();
        entity.setId(user.getId());

        PersonEntity person = new PersonEntity();
        person.setId(user.getIdPerson().getId());
        entity.setIdPerson(person);

        LanguageEntity language = new LanguageEntity();
        language.setId(user.getIdLanguage().getId());
        entity.setIdLanguage(language);

        entity.setUsername(user.getUsername());
        entity.setPassword(user.getPassword());
        entity.setStatus(user.getStatus());
        entity.setCreatedAt(user.getCreatedAt());
        entity.setUpdatedAt(user.getUpdatedAt());
        entity.setLastLogin(user.getLastLogin());
        return entity;
    }

    public User toDomain(UserEntity entity) {
        return new User(
                entity.getId(),
                personRepositoryAdapter.toDomain(entity.getIdPerson()),
                languageRepositoryAdapter.toDomain(entity.getIdLanguage()),
                entity.getUsername(),
                entity.getPassword(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getLastLogin()
        );
    }
}
