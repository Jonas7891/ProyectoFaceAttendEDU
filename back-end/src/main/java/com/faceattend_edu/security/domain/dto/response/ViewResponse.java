package com.faceattend_edu.security.domain.dto.response;

import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.LocalDateTime;
import java.util.List;

public record ViewResponse(

        @JsonView(Views.RolePermissions.class)
        Integer id,

        @JsonView({Views.Public.class, Views.RolePermissions.class})
        List<ActionResponse> actions,

        @JsonView({Views.Public.class, Views.RolePermissions.class})
        String name,

        @JsonView({Views.Public.class, Views.RolePermissions.class})
        String route,

        @JsonView({Views.Public.class, Views.RolePermissions.class})
        String title,

        @JsonView({Views.Public.class, Views.RolePermissions.class})
        boolean isPublic,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}