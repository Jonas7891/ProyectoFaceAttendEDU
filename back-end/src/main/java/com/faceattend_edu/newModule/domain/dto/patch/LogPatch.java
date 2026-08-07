package com.faceattend_edu.newModule.domain.dto.patch;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record LogPatch(
        UUID userId,

        String action,

        String tableName,

        String affectedRecord,

        String description,

        LocalDateTime date
) {
}
