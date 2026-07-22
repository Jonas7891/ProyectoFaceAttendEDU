package com.faceattend_edu.newModule.domain.dto.response;

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