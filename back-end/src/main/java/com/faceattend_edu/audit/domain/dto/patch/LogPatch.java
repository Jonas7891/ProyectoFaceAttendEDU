package com.faceattend_edu.audit.domain.dto.patch;

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
