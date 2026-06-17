package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.request.UserRequest;
import com.faceattend_edu.domain.dto.response.UserResponse;
import com.faceattend_edu.domain.model.Person;
import com.faceattend_edu.domain.model.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@AllArgsConstructor
public class UserServiceMapper {

    private final PersonServiceMapper personServiceMapper;

    public User toDomain(UserRequest request,
                         Person person) {
        return new User(
                null,
                person,
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
                personServiceMapper.toResponse(user.getPerson()),
                user.getUsername(),
                user.getPassword(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getLastLogin()
        );
    }
}
