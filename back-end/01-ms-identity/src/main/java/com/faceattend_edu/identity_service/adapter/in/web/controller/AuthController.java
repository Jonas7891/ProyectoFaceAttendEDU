package com.faceattend_edu.identity_service.adapter.in.web.controller;

import com.faceattend_edu.identity_service.adapter.in.web.dto.AuthRequest;
import com.faceattend_edu.identity_service.adapter.in.web.dto.UserSessionDto;
import com.faceattend_edu.identity_service.adapter.in.web.mapper.UserSessionWebMapper;
import com.faceattend_edu.identity_service.application.port.in.AuthenticateUserUseCase;
import com.faceattend_edu.identity_service.application.port.in.CloseUserSessionUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticateUserUseCase authenticateUserUseCase;
    private final CloseUserSessionUseCase closeUserSessionUseCase;
    private final UserSessionWebMapper sessionWebMapper;

    @PostMapping("/login")
    public ResponseEntity<UserSessionDto> login(@RequestBody AuthRequest authRequest) {
        return ResponseEntity.ok(sessionWebMapper.toDto(authenticateUserUseCase.authenticate(authRequest.getUsername(), authRequest.getPassword())));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestParam UUID sessionId) {
        closeUserSessionUseCase.closeSession(sessionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> me(@RequestParam String username) {
        return ResponseEntity.ok(Map.of("username", username));
    }
}
