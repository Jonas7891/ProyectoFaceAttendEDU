package com.faceattend_edu.domain.dto.response;

import com.faceattend_edu.domain.model.Role;
import com.faceattend_edu.domain.model.User;

import java.time.Instant;

public record UserRoleResponse(
        Integer id,
        User idUser,
        Role idRole,
        Instant assignedDate,
        Instant expiryDate
) {
}