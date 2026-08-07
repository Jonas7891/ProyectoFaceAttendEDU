package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Module;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.LocalDateTime;
import java.util.List;

public record RoleResponse(

        @JsonView({Views.RolePermissions.class, Views.UserDetail.class})
        Integer id,

        @JsonView({Views.Public.class, Views.RolePermissions.class})
        List<ModuleResponse> modules,

        @JsonView({Views.Public.class, Views.RolePermissions.class, Views.UserDetail.class})
        String name,

        @JsonView(Views.Public.class)
        String description,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}