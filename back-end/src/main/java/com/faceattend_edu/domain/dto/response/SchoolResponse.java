package com.faceattend_edu.domain.dto.response;

import java.time.Instant;

public record SchoolResponse(
        Integer id,
        String name,
        String nit,
        String address,
        String phone,
        String email,
        Boolean status,
        Instant createdAt,
        Instant updatedAt
) {
}