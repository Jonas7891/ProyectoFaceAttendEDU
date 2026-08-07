package com.faceattend_edu.domain.dto.response;

import java.time.Instant;

public record UserRoleResponse(
        Integer userId,
        Integer roleId,
        Instant assignedDate,
        Instant expiryDate
) {
}