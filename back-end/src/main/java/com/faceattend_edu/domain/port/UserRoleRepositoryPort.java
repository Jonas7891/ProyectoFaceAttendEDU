package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.UserRole;

import java.util.List;
import java.util.Optional;

public interface UserRoleRepositoryPort {
    UserRole save(UserRole userRole);

    Optional<UserRole> findById(Integer id);

    List<UserRole> findAll();

    void deleteById(Integer id);
}
