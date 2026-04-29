package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.UserRequest;
import com.faceattend_edu.domain.dto.response.UserResponse;
import com.faceattend_edu.domain.dto.response.UserRoleResponse;
import com.faceattend_edu.domain.model.User;
import com.faceattend_edu.infrastructure.persistence.adapter.RoleRepositoryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserServiceMapper {

    @Autowired
    private RoleRepositoryAdapter roleRepository;

    @Autowired
    private UserRoleServiceMapper userRoleMapper;

    public User toDomain(UserRequest request) {
        return new User(
                null,
                request.person(),
                request.username(),
                request.password(),
                request.status(),
                request.createdAt(),
                request.updatedAt(),
                request.lastLogin(),
                List.of()
        );
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getPerson(),
                user.getUsername(),
                user.getPassword(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getLastLogin()
        );
    }
}
