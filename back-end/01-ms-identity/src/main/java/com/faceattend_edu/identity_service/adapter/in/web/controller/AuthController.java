package com.faceattend_edu.identity_service.adapter.in.web.controller;

import com.faceattend_edu.identity_service.adapter.in.web.dto.AuthRequest;
import com.faceattend_edu.identity_service.adapter.in.web.dto.UserSessionDto;
import com.faceattend_edu.identity_service.adapter.in.web.mapper.UserSessionWebMapper;
import com.faceattend_edu.identity_service.application.port.in.AuthenticateUserUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticateUserUseCase authenticateUserUseCase;
    private final UserSessionWebMapper sessionWebMapper;

    @PostMapping("/login")
    public ResponseEntity<UserSessionDto> login(@RequestBody AuthRequest authRequest) {
        return ResponseEntity.ok(sessionWebMapper.toDto(authenticateUserUseCase.authenticate(authRequest.getUsername(), authRequest.getPassword())));
    }
}
