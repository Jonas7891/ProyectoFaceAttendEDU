package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Person;
import com.faceattend_edu.newModule.domain.model.Role;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        PersonResponse person,
        RoleResponse role,
        String username,
        String password,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}