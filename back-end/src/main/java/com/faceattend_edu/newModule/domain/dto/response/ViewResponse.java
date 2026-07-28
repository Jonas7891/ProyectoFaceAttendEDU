package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Action;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.LocalDateTime;
import java.util.List;

public record ViewResponse(

        Integer id,

        @JsonView(Views.Public.class)
        List<ActionResponse> actions,

        @JsonView(Views.Public.class)
        String name,

        @JsonView(Views.Public.class)
        String route,

        @JsonView(Views.Public.class)
        String title,

        @JsonView(Views.Public.class)
        boolean isPublic,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}