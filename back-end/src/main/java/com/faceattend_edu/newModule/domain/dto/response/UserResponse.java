package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Person;
import com.faceattend_edu.newModule.domain.model.Role;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(

        UUID id,

        @JsonView(Views.Public.class)
        PersonResponse person,

        @JsonView(Views.Public.class)
        RoleResponse role,

        @JsonView(Views.Public.class)
        String username,

        @JsonView(Views.Public.class)
        String password,

        @JsonView(Views.Public.class)
        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}