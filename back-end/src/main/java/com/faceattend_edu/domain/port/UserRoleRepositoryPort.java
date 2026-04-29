package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.UserRole;

import java.util.List;
import java.util.Optional;

public interface UserRoleRepositoryPort {

    Optional<UserRole> findByIdUserAndIdRole(Integer userId, Integer roleId);

    List<UserRole> findByIdUser(Integer userId);

    List<UserRole> findByIdRole(Integer roleId);

    List<UserRole> findActiveRolesByUserId(Integer userId);

    List<UserRole> findAll();

    UserRole save(UserRole userRole);

    void deleteByIdUserAndIdRole(Integer userId, Integer roleId);

    void deleteByIdUser(Integer userId);

    boolean existsByIdUserAndIdRole(Integer userId, Integer roleId);
}