package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.Role;

import java.util.List;
import java.util.Optional;

public interface RoleRepositoryPort {
    Role save(Role role);

    Optional<Role> findById(Integer id);

    List<Role> findAll();

    void deleteById(Integer id);

    boolean existsByName(String name);
}
