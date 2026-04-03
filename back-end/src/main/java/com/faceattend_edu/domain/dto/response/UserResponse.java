package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.Language;
import com.faceattend_edu.domain.model.Person;

import java.time.Instant;

public record UserResponse(
        Integer id,
        Person idPerson,
        Language idLanguage,
        String username,
        String password,
        Boolean status,
        Instant createdAt,
        Instant updatedAt,
        Instant lastLogin
) {
}