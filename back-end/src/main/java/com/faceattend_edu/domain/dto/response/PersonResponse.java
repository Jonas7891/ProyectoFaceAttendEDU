package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.School;

import java.time.Instant;

public record PersonResponse(
        Integer id,
        SchoolResponse school,
        String name,
        String lastName,
        String email,
        String phone,
        Boolean isStudent,
        Boolean isTeacher,
        Boolean status,
        Instant createdAt,
        Instant updatedAt
) {
}