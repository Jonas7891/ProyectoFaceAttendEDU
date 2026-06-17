package com.faceattend_edu.domain.dto.response;

import java.time.Instant;
import java.util.List;

public record FacialEmbeddingResponse(
        Integer id,
        PersonResponse person,
        List<Float> embedding,
        String modelVersion,
        Boolean isActive,
        Instant createdAt
) {
}