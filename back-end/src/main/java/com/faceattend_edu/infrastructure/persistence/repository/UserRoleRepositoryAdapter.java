package com.faceattend_edu.infrastructure.persistence.repository;

import com.faceattend_edu.domain.model.UserRole;
import com.faceattend_edu.domain.port.UserRoleRepositoryPort;
import com.faceattend_edu.infrastructure.persistence.entity.RoleEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserEntity;
import com.faceattend_edu.infrastructure.persistence.entity.UserRoleEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class UserRoleRepositoryAdapter implements UserRoleRepositoryPort {

    private final UserRoleJpaRepository jpaRepository;
    private final UserRepositoryAdapter userRepositoryAdapter;
    private final RoleRepositoryAdapter roleRepositoryAdapter;


    @Override
    public UserRole save(UserRole userRole) {
        UserRoleEntity entity = toEntity(userRole);
        UserRoleEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<UserRole> findById(Integer id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<UserRole> findAll() {
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

    private UserRoleEntity toEntity(UserRole userRole) {
        UserRoleEntity entity = new UserRoleEntity();

        UserEntity user = new UserEntity();
        user.setId(userRole.getIdUser().getId());
        entity.setIdUser(user);

        RoleEntity role = new RoleEntity();
        role.setId(userRole.getIdRole().getId());
        entity.setIdRole(role);

        entity.setAssignedDate(userRole.getAssignedDate());
        entity.setExpiryDate(userRole.getExpiryDate());
        return entity;
    }

    public UserRole toDomain(UserRoleEntity entity) {
        return new UserRole(
                null,
                userRepositoryAdapter.toDomain(entity.getIdUser()),
                roleRepositoryAdapter.toDomain(entity.getIdRole()),
                entity.getAssignedDate(),
                entity.getExpiryDate()
        );
    }
}
