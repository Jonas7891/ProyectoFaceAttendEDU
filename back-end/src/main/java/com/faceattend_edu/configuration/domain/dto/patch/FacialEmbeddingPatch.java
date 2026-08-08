package com.faceattend_edu.configuration.domain.dto.patch;

import java.util.UUID;

public record FacialEmbeddingPatch(
        UUID personId,

        String embedding,

        String modelVersion
) {
}
