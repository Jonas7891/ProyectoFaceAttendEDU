package com.faceattend_edu.identity_service.domain.event;

import java.time.Instant;
import java.util.UUID;

public record PersonTransferredToSchool(
        UUID personId,
        UUID fromSchoolId,
        UUID toSchoolId,
        Instant occurredAt
) {
}
