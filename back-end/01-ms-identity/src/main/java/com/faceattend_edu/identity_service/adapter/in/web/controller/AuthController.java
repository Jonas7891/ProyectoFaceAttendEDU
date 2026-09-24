package com.faceattend_edu.identity_service.adapter.in.web.controller;

import com.faceattend_edu.identity_service.adapter.in.web.dto.AuthRequest;
import com.faceattend_edu.identity_service.adapter.in.web.dto.UserDto;
import com.faceattend_edu.identity_service.adapter.in.web.dto.UserSessionDto;
import com.faceattend_edu.identity_service.adapter.in.web.mapper.UserSessionWebMapper;
import com.faceattend_edu.identity_service.adapter.in.web.mapper.UserWebMapper;
import com.faceattend_edu.identity_service.application.port.in.AuthenticateUserUseCase;
import com.faceattend_edu.identity_service.application.port.in.CloseUserSessionUseCase;
import com.faceattend_edu.identity_service.application.port.in.GetUserByUsernameUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticateUserUseCase authenticateUserUseCase;
    private final CloseUserSessionUseCase closeUserSessionUseCase;
    private final GetUserByUsernameUseCase getUserByUsernameUseCase;
    private final UserSessionWebMapper sessionWebMapper;
    private final UserWebMapper userWebMapper;

    @PostMapping("/login")
    public ResponseEntity<UserSessionDto> login(@Valid @RequestBody AuthRequest authRequest) {
        return ResponseEntity.ok(sessionWebMapper.toDto(
                authenticateUserUseCase.authenticate(authRequest.getUsername(), authRequest.getPassword())));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestParam UUID sessionId) {
        closeUserSessionUseCase.closeSession(sessionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@RequestParam String username) {
        return ResponseEntity.ok(userWebMapper.toDto(getUserByUsernameUseCase.getUserByUsername(username)));
    }
}
