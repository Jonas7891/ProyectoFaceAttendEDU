package com.faceattend_edu.configuration.domain.dto.response;

import com.faceattend_edu.security.domain.dto.response.PersonResponse;
import com.faceattend_edu.util.Views;
import com.fasterxml.jackson.annotation.JsonView;

import java.time.LocalDateTime;
import java.util.UUID;

public record FacialEmbeddingResponse(

        @JsonView(Views.ActiveFacialEmbeddings.class)
        UUID id,

        @JsonView({Views.Public.class, Views.ActiveFacialEmbeddings.class})
        PersonResponse person,

        @JsonView({Views.Public.class, Views.ActiveFacialEmbeddings.class})
        String embedding, // VECTOR

        @JsonView({Views.Public.class, Views.ActiveFacialEmbeddings.class})
        String modelVersion,

        boolean status,

        @JsonView(Views.ActiveFacialEmbeddings.class)
        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}