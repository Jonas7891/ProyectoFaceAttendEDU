package com.faceattend_edu.identity_service.adapter.out.persistence;

import com.faceattend_edu.identity_service.adapter.out.persistence.mapper.UserPersistenceMapper;
import com.faceattend_edu.identity_service.adapter.out.persistence.repository.UserJpaRepository;
import com.faceattend_edu.identity_service.application.port.out.LoadUserPort;
import com.faceattend_edu.identity_service.application.port.out.SaveUserPort;
import com.faceattend_edu.identity_service.application.port.out.UpdateUserPort;
import com.faceattend_edu.identity_service.application.port.out.LoadUserByUsernamePort;
import com.faceattend_edu.identity_service.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserPersistenceAdapter implements LoadUserPort, SaveUserPort, UpdateUserPort, LoadUserByUsernamePort {

    private final UserJpaRepository repository;
    private final UserPersistenceMapper mapper;

    @Override
    public User loadUser(UUID userId) {
        return mapper.toDomain(repository.findById(userId).orElse(null));
    }

    @Override
    public User loadUserByUsername(String username) {
        return mapper.toDomain(repository.findByUsername(username).orElse(null));
    }

    @Override
    public User saveUser(User user) {
        return mapper.toDomain(repository.save(mapper.toEntity(user)));
    }

    @Override
    public void updateUser(User user) {
        repository.save(mapper.toEntity(user));
    }
}
