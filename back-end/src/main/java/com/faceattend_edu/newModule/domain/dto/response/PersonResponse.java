package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.School;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record PersonResponse(

        UUID id,

        @JsonView(Views.Public.class)
        SchoolResponse school,

        @JsonView(Views.Public.class)
        String name,

        @JsonView(Views.Public.class)
        String lastName,

        @JsonView(Views.Public.class)
        String email,

        @JsonView(Views.Public.class)
        String phone,

        @JsonView(Views.Public.class)
        boolean isStudent,

        @JsonView(Views.Public.class)
        boolean isTeacher,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}