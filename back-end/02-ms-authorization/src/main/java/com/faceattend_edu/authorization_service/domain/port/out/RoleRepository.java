package com.faceattend_edu.authorization_service.domain.port.out;
import com.faceattend_edu.authorization_service.domain.model.Role;
import java.util.Optional;
public interface RoleRepository { void save(Role r); Optional<Role> findById(Integer id); }
