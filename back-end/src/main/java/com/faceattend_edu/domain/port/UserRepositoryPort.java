package com.faceattend_edu.domain.port;

import com.faceattend_edu.domain.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepositoryPort {
    User save(User user);

    Optional<User> findById(Integer id);

    List<User> findAll();

    void deleteById(Integer id);

    boolean existsByUsername(String username);
}
