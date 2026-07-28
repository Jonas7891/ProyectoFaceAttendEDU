package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.School;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.LocalDateTime;

public record CourseResponse(

        Integer id,

        @JsonView(Views.Public.class)
        SchoolResponse school,

        @JsonView(Views.Public.class)
        String name,

        @JsonView(Views.Public.class)
        String code,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}