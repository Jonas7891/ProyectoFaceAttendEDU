package com.faceattend_edu.application.mapper;

import com.faceattend_edu.domain.dto.response.AuthResponse;
import org.springframework.stereotype.Component;

@Component
public class AuthServiceMapper {
    public AuthResponse toResponse(String token) {
        return new AuthResponse(
                token
        );
    }
}
