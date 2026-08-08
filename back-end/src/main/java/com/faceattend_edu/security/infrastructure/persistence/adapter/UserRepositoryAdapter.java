package com.faceattend_edu.security.infrastructure.persistence.adapter;

import com.faceattend_edu.security.domain.model.User;
import com.faceattend_edu.security.domain.port.UserRepositoryPort;
import com.faceattend_edu.security.infrastructure.persistence.entity.UserEntity;
import com.faceattend_edu.security.infrastructure.persistence.mapper.UserRepositoryMapper;
import com.faceattend_edu.security.infrastructure.persistence.repository.UserJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.function.Function;

@Component
@AllArgsConstructor
public class UserRepositoryAdapter
        extends AbstractRepositoryAdapter<UserEntity, User, UUID>
        implements UserRepositoryPort {

    private final UserJpaRepository jpaRepository;
    private final UserRepositoryMapper mapper;

    @Override
    protected JpaRepository<UserEntity, UUID> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<User, UserEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<UserEntity, User> toDomainMapper() {
        return mapper::toDomain;
    }
}
