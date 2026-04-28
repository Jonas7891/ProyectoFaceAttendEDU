package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.Person;
import com.faceattend_edu.domain.model.Role;

import java.time.Instant;
import java.util.List;

public record UserResponse(
        Integer id,
        Person person,
        String username,
        String password,
        Boolean status,
        Instant createdAt,
        Instant updatedAt,
        Instant lastLogin,
        List<UserRoleResponse> roles
) {
}