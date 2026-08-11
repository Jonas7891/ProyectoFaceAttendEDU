package com.faceattend_edu.security.infrastructure.persistence.adapter;

import com.faceattend_edu.security.domain.model.Role;
import com.faceattend_edu.security.domain.port.RoleRepositoryPort;
import com.faceattend_edu.security.infrastructure.persistence.entity.RoleEntity;
import com.faceattend_edu.security.infrastructure.persistence.mapper.RoleRepositoryMapper;
import com.faceattend_edu.security.infrastructure.persistence.repository.RoleJpaRepository;
import com.faceattend_edu.util.infrastructure.AbstractRepositoryAdapter;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
@AllArgsConstructor
public class RoleRepositoryAdapter
        extends AbstractRepositoryAdapter<RoleEntity, Role, Integer>
        implements RoleRepositoryPort {

    private final RoleJpaRepository jpaRepository;
    private final RoleRepositoryMapper mapper;

    @Override
    protected JpaRepository<RoleEntity, Integer> getJpaRepository() {
        return jpaRepository;
    }

    @Override
    protected Function<Role, RoleEntity> toEntityMapper() {
        return mapper::toEntity;
    }

    @Override
    protected Function<RoleEntity, Role> toDomainMapper() {
        return mapper::toDomain;
    }
}
