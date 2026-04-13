package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.UserRequest;
import com.faceattend_edu.domain.dto.response.UserResponse;
import com.faceattend_edu.domain.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toDomain(UserRequest request) {
        return new User(
                null,
                request.idPerson(),
                request.idLanguage(),
                request.username(),
                request.password(),
                request.status(),
                request.createdAt(),
                request.updatedAt(),
                request.lastLogin()
        );
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getIdPerson(),
                user.getIdLanguage(),
                user.getUsername(),
                user.getPassword(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getLastLogin()
        );
    }
}
