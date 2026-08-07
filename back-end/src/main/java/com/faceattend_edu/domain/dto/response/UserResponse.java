package com.faceattend_edu.domain.dto.response;

import java.time.Instant;

public record UserResponse(
        Integer id,
        PersonResponse person,
        String username,
        String password,
        Boolean status,
        Instant createdAt,
        Instant updatedAt,
        Instant lastLogin
) {
}