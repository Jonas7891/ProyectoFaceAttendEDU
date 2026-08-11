package com.faceattend_edu.security.domain.dto.response;

import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.LocalDateTime;
import java.util.List;

public record ModuleResponse(

        @JsonView(Views.RolePermissions.class)
        Integer id,

        @JsonView({Views.Public.class, Views.RolePermissions.class})
        List<ViewResponse> views,

        @JsonView({Views.Public.class, Views.RolePermissions.class})
        String name,

        @JsonView(Views.Public.class)
        String description,

        @JsonView(Views.Public.class)
        String icon,

        @JsonView({Views.Public.class, Views.RolePermissions.class})
        Integer order,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}