package com.faceattend_edu.identity_service.adapter.out.persistence;

import com.faceattend_edu.identity_service.adapter.out.persistence.entity.UserJpaEntity;
import com.faceattend_edu.identity_service.adapter.out.persistence.mapper.UserPersistenceMapper;
import com.faceattend_edu.identity_service.adapter.out.persistence.repository.UserJpaRepository;
import com.faceattend_edu.identity_service.application.port.out.LoadUserPort;
import com.faceattend_edu.identity_service.application.port.out.SaveUserPort;
import com.faceattend_edu.identity_service.application.port.out.UpdateUserPort;
import com.faceattend_edu.identity_service.application.port.out.LoadUserByIdentifierPort;
import com.faceattend_edu.identity_service.application.port.out.LoadUserByUsernamePort;
import com.faceattend_edu.identity_service.application.port.out.ListUsersPort;
import com.faceattend_edu.identity_service.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserPersistenceAdapter implements LoadUserPort, SaveUserPort, UpdateUserPort, LoadUserByUsernamePort,
        LoadUserByIdentifierPort, ListUsersPort {

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

    /**
     * Identifier resolution lives here (not in a use case) so both login and /me share one
     * definition: '@' means email, anything else means username.
     */
    @Override
    public User loadUserByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) return null;

        String value = identifier.trim();
        if (!value.contains("@")) {
            return mapper.toDomain(repository.findByUsername(value).orElse(null));
        }

        // Ambiguous emails resolve to null: the 401 must not reveal whether the address exists.
        List<UserJpaEntity> matches = repository.findByPersonEmail(value);
        return matches.size() == 1 ? mapper.toDomain(matches.get(0)) : null;
    }

    @Override
    public List<User> listUsers() {
        return repository.findAll().stream().map(mapper::toDomain).collect(Collectors.toList());
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
