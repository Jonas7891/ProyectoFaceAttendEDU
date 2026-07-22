package com.faceattend_edu.newModule.domain.dto.response;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

public record SchoolResponse(
        UUID id,
        String name,
        String nit,
        String address,
        String phone,
        String email,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}