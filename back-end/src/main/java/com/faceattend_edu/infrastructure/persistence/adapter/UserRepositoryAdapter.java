package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.Person;
import com.faceattend_edu.domain.model.User;
import com.faceattend_edu.domain.port.UserRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.PersonEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.UserRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.UserJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class UserRepositoryAdapter implements UserRepositoryPort {

    private final UserJpaRepository jpaRepository;
    private final UserRepositoryMapper mapper;

    @Override
    public User save(User user) {
        UserEntity entity = mapper.toEntity(user);
        UserEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<User> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<User> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
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

    @Override
    public Optional<User> findByEmail(String email) {
        return jpaRepository
                .findByPersonEmail(email)
                .map(mapper::toDomain);
    }

}
