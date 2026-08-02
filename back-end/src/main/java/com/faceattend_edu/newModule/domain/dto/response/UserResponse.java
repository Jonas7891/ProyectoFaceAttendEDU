package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Person;
import com.faceattend_edu.newModule.domain.model.Role;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(

        @JsonView(Views.UserDetail.class)
        UUID id,

        @JsonView({Views.Public.class, Views.UserDetail.class, Views.AuditLog.class})
        PersonResponse person,

        @JsonView({Views.Public.class, Views.UserDetail.class})
        RoleResponse role,

        @JsonView({Views.Public.class, Views.UserDetail.class, Views.AuditLog.class})
        String username,

        @JsonView(Views.Public.class)
        String password,

        @JsonView({Views.Public.class, Views.UserDetail.class})
        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}