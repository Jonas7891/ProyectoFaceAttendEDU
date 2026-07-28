package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Person;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record FacialEmbeddingResponse(

        UUID id,

        @JsonView(Views.Public.class)
        PersonResponse person,

        @JsonView(Views.Public.class)
        String embedding, // VECTOR

        @JsonView(Views.Public.class)
        String modelVersion,

        boolean status,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}