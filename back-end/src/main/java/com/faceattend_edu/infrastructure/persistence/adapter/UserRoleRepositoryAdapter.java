package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.UserRole;
import com.faceattend_edu.domain.port.UserRoleRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.RoleEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserRoleEntity;
import com.faceattend_edu.infrastructure.persistence.mapper.UserRoleRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.UserRoleJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class UserRoleRepositoryAdapter implements UserRoleRepositoryPort {

    private final UserRoleJpaRepository jpaRepository;
    private final UserRoleRepositoryMapper mapper;

    @Override
    public UserRole save(UserRole userRole) {
        UserRoleEntity entity = mapper.toEntity(userRole);
        UserRoleEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<UserRole> findById(Integer id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<UserRole> findByUserId(Integer id) {
        return Optional.empty();
    }

    @Override
    public Optional<UserRole> findByRoleId(Integer id) {
        return Optional.empty();
    }

    @Override
    public List<UserRole> findAll() {
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
    public void assignRole(UserRole userRole) {

    }
}
