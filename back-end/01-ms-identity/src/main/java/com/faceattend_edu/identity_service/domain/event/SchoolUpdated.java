package com.faceattend_edu.identity_service.domain.event;

import java.time.Instant;

public record SchoolUpdated(
        String name,
        String address,
        String phone,
        String nit,
        Instant occurredAt
) {
}
