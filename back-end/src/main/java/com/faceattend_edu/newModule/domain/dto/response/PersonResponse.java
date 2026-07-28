package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.School;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record PersonResponse(
        UUID id,
        SchoolResponse school,
        String name,
        String lastName,
        String email,
        String phone,
        boolean isStudent,
        boolean isTeacher,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}