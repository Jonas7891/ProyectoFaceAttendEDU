package com.faceattend_edu.identity_service.domain.event;

import java.time.Instant;
import java.util.UUID;

public record SchoolDeactivated(
        UUID schoolId,
        Boolean status,
        Instant occurredAt
) {
}
