package com.faceattend_edu.infrastructure.persistence.adapter;

import com.faceattend_edu.domain.model.UserRole;
import com.faceattend_edu.domain.port.UserRoleRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.UserRoleEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserRoleEntityId;
import com.faceattend_edu.infrastructure.persistence.mapper.UserRoleRepositoryMapper;
import com.faceattend_edu.infrastructure.persistence.repository.UserRoleJpaRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Component
public class UserRoleRepositoryAdapter implements UserRoleRepositoryPort {

    private final UserRoleJpaRepository repository;
    private final UserRoleRepositoryMapper mapper;

    @Override
    public Optional<UserRole> findByIdUserAndIdRole(Integer userId, Integer roleId) {
        UserRoleEntityId id = new UserRoleEntityId(userId, roleId);
        return repository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<UserRole> findByIdUser(Integer userId) {
        return repository.findByIdUser(userId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<UserRole> findByIdRole(Integer roleId) {
        return repository.findByIdRole(roleId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<UserRole> findActiveRolesByUserId(Integer userId) {
        return repository.findActiveRolesByUserId(userId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<UserRole> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public UserRole save(UserRole userRole) {
        UserRoleEntity entity = mapper.toEntity(userRole);
        UserRoleEntity saved = repository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteByIdUserAndIdRole(Integer userId, Integer roleId) {
        UserRoleEntityId id = new UserRoleEntityId(userId, roleId);
        repository.deleteById(id);
    }

    @Override
    public void deleteByIdUser(Integer userId) {
        repository.deleteByIdUser(userId);
    }

    @Override
    public boolean existsByIdUserAndIdRole(Integer userId, Integer roleId) {
        return repository.existsByIdUserAndIdRole(userId, roleId);
    }
}