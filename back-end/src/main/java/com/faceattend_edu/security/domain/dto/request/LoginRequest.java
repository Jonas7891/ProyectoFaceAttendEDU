package com.faceattend_edu.security.domain.dto.request;

public record LoginRequest(
        String email,
        String password
) {
}
