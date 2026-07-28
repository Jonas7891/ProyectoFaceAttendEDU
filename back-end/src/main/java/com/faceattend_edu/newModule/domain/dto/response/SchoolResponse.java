package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record SchoolResponse(

        UUID id,

        @JsonView(Views.Public.class)
        String name,

        @JsonView(Views.Public.class)
        String nit,

        @JsonView(Views.Public.class)
        String address,

        @JsonView(Views.Public.class)
        String phone,

        @JsonView(Views.Public.class)
        String email,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}