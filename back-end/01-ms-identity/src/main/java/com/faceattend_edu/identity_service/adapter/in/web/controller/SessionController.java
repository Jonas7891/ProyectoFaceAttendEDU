package com.faceattend_edu.identity_service.adapter.in.web.controller;

import com.faceattend_edu.identity_service.adapter.in.web.dto.UserSessionDto;
import com.faceattend_edu.identity_service.adapter.in.web.mapper.UserSessionWebMapper;
import com.faceattend_edu.identity_service.application.port.in.CloseUserSessionUseCase;
import com.faceattend_edu.identity_service.application.port.in.CreateUserSessionUseCase;
import com.faceattend_edu.identity_service.application.port.in.GetUserSessionsUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final CreateUserSessionUseCase createUserSessionUseCase;
    private final CloseUserSessionUseCase closeUserSessionUseCase;
    private final GetUserSessionsUseCase getUserSessionsUseCase;
    private final UserSessionWebMapper sessionWebMapper;

    @PostMapping
    public ResponseEntity<UserSessionDto> createSession(@RequestParam UUID userId, @RequestParam String sourceIp) {
        return ResponseEntity.ok(sessionWebMapper.toDto(createUserSessionUseCase.createSession(userId, sourceIp)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> closeSession(@PathVariable UUID id) {
        closeUserSessionUseCase.closeSession(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserSessionDto>> getUserSessions(@PathVariable UUID userId) {
        return ResponseEntity.ok(getUserSessionsUseCase.getUserSessions(userId).stream()
                .map(sessionWebMapper::toDto)
                .collect(Collectors.toList()));
    }
}
