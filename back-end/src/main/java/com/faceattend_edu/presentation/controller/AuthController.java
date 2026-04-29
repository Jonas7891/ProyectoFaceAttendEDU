package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.impl.AuthServiceImpl;
import com.faceattend_edu.application.service.AuthService;
import com.faceattend_edu.domain.dto.request.LoginRequest;
import com.faceattend_edu.domain.dto.response.AuthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request
    ) {

        String token = authService.login(
                request.email(),
                request.password()
        );

        return ResponseEntity.ok(
                new AuthResponse(token)
        );
    }
}
