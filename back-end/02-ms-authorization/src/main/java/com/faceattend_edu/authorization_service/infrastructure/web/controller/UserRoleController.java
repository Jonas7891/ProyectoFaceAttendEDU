package com.faceattend_edu.authorization_service.infrastructure.web.controller;

import com.faceattend_edu.authorization_service.domain.model.Role;
import com.faceattend_edu.authorization_service.domain.port.in.AssignRoleToUserUseCase;
import com.faceattend_edu.authorization_service.domain.port.in.CheckPermissionUseCase;
import com.faceattend_edu.authorization_service.domain.port.out.UserRoleRepository;
import com.faceattend_edu.authorization_service.infrastructure.web.dto.AssignRoleRequest;
import com.faceattend_edu.authorization_service.infrastructure.web.dto.RoleResponse;
import com.faceattend_edu.authorization_service.infrastructure.web.mapper.RoleWebMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class UserRoleController {

    private final AssignRoleToUserUseCase assignRoleToUserUseCase;
    private final CheckPermissionUseCase checkPermissionUseCase;
    private final UserRoleRepository userRoleRepository;
    private final RoleWebMapper roleWebMapper;

    @PostMapping({"/api/v1/users/{userId}/roles", "/users/{userId}/roles"})
    public ResponseEntity<Void> assignRole(@PathVariable UUID userId, @Valid @RequestBody AssignRoleRequest req) {
        assignRoleToUserUseCase.assignRoleToUser(userId, req.getRoleId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping({"/api/v1/users/{userId}/roles/{roleId}", "/users/{userId}/roles/{roleId}"})
    public ResponseEntity<Void> removeRole(@PathVariable UUID userId, @PathVariable Integer roleId) {
        assignRoleToUserUseCase.removeRoleFromUser(userId, roleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping({"/api/v1/users/{userId}/roles", "/users/{userId}/roles"})
    public ResponseEntity<List<RoleResponse>> getRolesForUser(@PathVariable UUID userId) {
        List<Role> roles = userRoleRepository.findRolesByUserId(userId);
        List<RoleResponse> resp = roles.stream().map(roleWebMapper::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(resp);
    }

    @GetMapping({"/api/v1/auth/evaluate", "/auth/evaluate"})
    public ResponseEntity<Map<String,Object>> evaluate(@RequestParam UUID userId, @RequestParam String permission) {
        boolean has = checkPermissionUseCase.hasPermission(userId, permission);
        return ResponseEntity.ok(Map.of("userId", userId.toString(), "permission", permission, "allowed", has));
    }
}
