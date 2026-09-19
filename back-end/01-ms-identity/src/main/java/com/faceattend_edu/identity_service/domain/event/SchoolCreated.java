package com.faceattend_edu.identity_service.domain.event;

import java.time.Instant;
import java.util.UUID;

public record SchoolCreated(
        UUID schoolId,
        String name,
        String nit,
        Instant occurredAt
) {
}
