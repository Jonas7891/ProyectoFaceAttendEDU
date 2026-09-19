package com.faceattend_edu.identity_service.adapter.in.web.controller;

import com.faceattend_edu.identity_service.adapter.in.web.dto.UserDto;
import com.faceattend_edu.identity_service.adapter.in.web.mapper.UserWebMapper;
import com.faceattend_edu.identity_service.application.port.in.ChangeUserStatusUseCase;
import com.faceattend_edu.identity_service.application.port.in.CreateUserUseCase;
import com.faceattend_edu.identity_service.application.port.in.GetUserUseCase;
import com.faceattend_edu.identity_service.application.port.in.UpdateUserUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final CreateUserUseCase createUserUseCase;
    private final GetUserUseCase getUserUseCase;
    private final UpdateUserUseCase updateUserUseCase;
    private final ChangeUserStatusUseCase changeUserStatusUseCase;
    private final UserWebMapper userWebMapper;

    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        return ResponseEntity.ok(userWebMapper.toDto(createUserUseCase.createUser(userWebMapper.toDomain(userDto))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userWebMapper.toDto(getUserUseCase.getUser(id)));
    }

    @PutMapping
    public ResponseEntity<Void> updateUser(@RequestBody UserDto userDto) {
        updateUserUseCase.updateUser(userWebMapper.toDomain(userDto));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> changeStatus(@PathVariable UUID id, @RequestParam boolean status) {
        changeUserStatusUseCase.changeStatus(id, status);
        return ResponseEntity.noContent().build();
    }
}
