package com.faceattend_edu.authorization_service.infrastructure.web.controller;

import com.faceattend_edu.authorization_service.domain.model.Caller;
import com.faceattend_edu.authorization_service.domain.port.in.AssignRoleToUserUseCase;
import com.faceattend_edu.authorization_service.domain.port.in.CheckPermissionUseCase;
import com.faceattend_edu.authorization_service.domain.port.in.GetUserRolesUseCase;
import com.faceattend_edu.authorization_service.infrastructure.web.dto.AssignRoleRequest;
import com.faceattend_edu.authorization_service.infrastructure.web.dto.RoleResponse;
import com.faceattend_edu.authorization_service.infrastructure.web.mapper.RoleWebMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/** HTTP adapter for user roles; who may change which role is decided by the use case. */
@RestController
@RequiredArgsConstructor
public class UserRoleController {

    private final AssignRoleToUserUseCase assignRoleToUserUseCase;
    private final CheckPermissionUseCase checkPermissionUseCase;
    private final GetUserRolesUseCase getUserRolesUseCase;
    private final RoleWebMapper roleWebMapper;

    @PostMapping({"/api/v1/users/{userId}/roles", "/users/{userId}/roles"})
    public ResponseEntity<Void> assignRole(@PathVariable UUID userId, @Valid @RequestBody AssignRoleRequest req,
                                           HttpServletRequest request) {
        assignRoleToUserUseCase.assignRoleToUser(caller(request), userId, req.getRoleId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping({"/api/v1/users/{userId}/roles/{roleId}", "/users/{userId}/roles/{roleId}"})
    public ResponseEntity<Void> removeRole(@PathVariable UUID userId, @PathVariable Integer roleId,
                                           HttpServletRequest request) {
        assignRoleToUserUseCase.removeRoleFromUser(caller(request), userId, roleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping({"/api/v1/users/{userId}/roles", "/users/{userId}/roles"})
    public ResponseEntity<List<RoleResponse>> getRolesForUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(getUserRolesUseCase.rolesOf(userId).stream()
                .map(roleWebMapper::toResponse).collect(Collectors.toList()));
    }

    /**
     * Batch variant of the endpoint above: the users screen asks for every listed user at once
     * instead of one request per user. Users without an assignment are absent from the map.
     */
    @GetMapping({"/api/v1/user-roles", "/user-roles"})
    public ResponseEntity<Map<String, List<RoleResponse>>> getRolesForUsers(
            @RequestParam(name = "userIds", required = false) List<UUID> userIds) {
        Map<String, List<RoleResponse>> body = getUserRolesUseCase.rolesOf(userIds).entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> entry.getKey().toString(),
                        entry -> entry.getValue().stream().map(roleWebMapper::toResponse).collect(Collectors.toList())));
        return ResponseEntity.ok(body);
    }

    @GetMapping({"/api/v1/auth/evaluate", "/auth/evaluate"})
    public ResponseEntity<Map<String,Object>> evaluate(@RequestParam UUID userId, @RequestParam String permission) {
        boolean has = checkPermissionUseCase.hasPermission(userId, permission);
        return ResponseEntity.ok(Map.of("userId", userId.toString(), "permission", permission, "allowed", has));
    }

    /** The caller as AuthTokenFilter left it on the request. */
    private static Caller caller(HttpServletRequest request) {
        Object id = request.getAttribute("X-User-Id");
        List<String> roles = request.getAttribute("X-User-Roles") instanceof List<?> list
                ? list.stream().map(String::valueOf).toList()
                : List.of();
        return new Caller(id == null ? null : String.valueOf(id), roles);
    }
}
