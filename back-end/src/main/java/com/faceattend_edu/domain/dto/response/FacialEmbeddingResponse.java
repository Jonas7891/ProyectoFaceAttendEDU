package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.Person;

import java.time.Instant;
import java.util.List;

public record FacialEmbeddingResponse(
        Integer id,
        Person idPerson,
        List<Float> embedding,
        String modelVersion,
        Boolean isActive,
        Instant createdAt
) {
}