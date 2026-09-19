package com.faceattend_edu.authorization_service.infrastructure.persistence.adapter;

import com.faceattend_edu.authorization_service.domain.model.Role;
import com.faceattend_edu.authorization_service.domain.model.UserRole;
import com.faceattend_edu.authorization_service.domain.port.out.UserRoleRepository;
import com.faceattend_edu.authorization_service.infrastructure.persistence.entity.UserRoleId;
import com.faceattend_edu.authorization_service.infrastructure.persistence.mapper.RolePersistenceMapper;
import com.faceattend_edu.authorization_service.infrastructure.persistence.mapper.UserRolePersistenceMapper;
import com.faceattend_edu.authorization_service.infrastructure.persistence.repository.RoleJpaRepository;
import com.faceattend_edu.authorization_service.infrastructure.persistence.repository.UserRoleJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserRolePersistenceAdapter implements UserRoleRepository {

    private final UserRoleJpaRepository jpaRepository;
    private final RoleJpaRepository roleJpaRepository;
    private final UserRolePersistenceMapper mapper;
    private final RolePersistenceMapper roleMapper;

    @Override
    public UserRole save(UserRole userRole) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(userRole)));
    }

    @Override
    public void delete(UUID userId, Integer roleId) {
        jpaRepository.deleteById(new UserRoleId(userId, roleId));
    }

    @Override
    public boolean exists(UUID userId, Integer roleId) {
        return jpaRepository.existsByUserIdAndRoleId(userId, roleId);
    }

    @Override
    public List<Role> findRolesByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).stream()
                .map(ur -> roleJpaRepository.findById(ur.getRoleId()).orElse(null))
                .filter(e -> e != null)
                .map(roleMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserRole> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).stream().map(mapper::toDomain).collect(Collectors.toList());
    }
}
