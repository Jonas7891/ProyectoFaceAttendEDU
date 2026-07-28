package com.faceattend_edu.newModule.domain.dto.response;

import com.faceattend_edu.newModule.domain.model.Person;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record FacialEmbeddingResponse(
        UUID id,
        PersonResponse person,
        String embedding, // VECTOR
        String modelVersion,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}