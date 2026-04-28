package com.faceattend_edu.domain.dto.request;

public record LoginRequest(
        String email,
        String password
) {}
