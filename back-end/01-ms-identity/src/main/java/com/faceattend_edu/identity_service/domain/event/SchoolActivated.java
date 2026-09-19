package com.faceattend_edu.identity_service.domain.event;

import java.util.UUID;
import java.time.Instant;

public record SchoolActivated(
        UUID schoolId,
        Boolean status,
        Instant occurredAt
) {
}
