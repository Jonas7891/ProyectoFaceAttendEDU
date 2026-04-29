package com.faceattend_edu.infrastructure.controller;

import com.faceattend_edu.application.service.UserRoleService;
import com.faceattend_edu.domain.dto.request.UserRoleRequest;
import com.faceattend_edu.domain.dto.response.UserRoleResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/user-roles")
public class UserRoleController {

    private final UserRoleService userRoleService;

    /**
     * Obtener una relación usuario-rol específica
     * GET /api/user-roles/user/{userId}/role/{roleId}
     */
    @GetMapping("/user/{userId}/role/{roleId}")
    public ResponseEntity<UserRoleResponse> findByIdUserAndIdRole(
            @PathVariable Integer userId,
            @PathVariable Integer roleId) {
        UserRoleResponse response = userRoleService.findByIdUserAndIdRole(userId, roleId);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener todos los roles de un usuario
     * GET /api/user-roles/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserRoleResponse>> findByIdUser(@PathVariable Integer userId) {
        List<UserRoleResponse> roles = userRoleService.findByIdUser(userId);
        return ResponseEntity.ok(roles);
    }

    /**
     * Obtener todos los usuarios con un rol específico
     * GET /api/user-roles/role/{roleId}
     */
    @GetMapping("/role/{roleId}")
    public ResponseEntity<List<UserRoleResponse>> findByIdRole(@PathVariable Integer roleId) {
        List<UserRoleResponse> users = userRoleService.findByIdRole(roleId);
        return ResponseEntity.ok(users);
    }

    /**
     * Obtener roles activos (no expirados) de un usuario
     * GET /api/user-roles/user/{userId}/active
     */
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<List<UserRoleResponse>> findActiveRolesByUserId(@PathVariable Integer userId) {
        List<UserRoleResponse> roles = userRoleService.findActiveRolesByUserId(userId);
        return ResponseEntity.ok(roles);
    }

    /**
     * Obtener todas las relaciones usuario-rol
     * GET /api/user-roles
     */
    @GetMapping
    public ResponseEntity<List<UserRoleResponse>> findAll() {
        List<UserRoleResponse> roles = userRoleService.findAll();
        return ResponseEntity.ok(roles);
    }

    /**
     * Asignar un rol a un usuario
     * POST /api/user-roles
     */
    @PostMapping
    public ResponseEntity<UserRoleResponse> save(@RequestBody UserRoleRequest request) {
        UserRoleResponse response = userRoleService.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Actualizar fecha de expiración de un rol
     * PUT /api/user-roles/user/{userId}/role/{roleId}/expiry
     */
    @PutMapping("/user/{userId}/role/{roleId}/expiry")
    public ResponseEntity<UserRoleResponse> updateExpiryDate(
            @PathVariable Integer userId,
            @PathVariable Integer roleId,
            @RequestParam Instant expiryDate) {
        UserRoleResponse response = userRoleService.updateExpiryDate(userId, roleId, expiryDate);
        return ResponseEntity.ok(response);
    }

    /**
     * Revocar un rol a un usuario
     * DELETE /api/user-roles/user/{userId}/role/{roleId}
     */
    @DeleteMapping("/user/{userId}/role/{roleId}")
    public ResponseEntity<Void> deleteByIdUserAndIdRole(
            @PathVariable Integer userId,
            @PathVariable Integer roleId) {
        userRoleService.deleteByIdUserAndIdRole(userId, roleId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Revocar todos los roles de un usuario
     * DELETE /api/user-roles/user/{userId}
     */
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteByIdUser(@PathVariable Integer userId) {
        userRoleService.deleteByIdUser(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Verificar si un usuario tiene un rol específico
     * GET /api/user-roles/user/{userId}/role/{roleId}/check
     */
    @GetMapping("/user/{userId}/role/{roleId}/check")
    public ResponseEntity<Boolean> userHasRole(
            @PathVariable Integer userId,
            @PathVariable Integer roleId) {
        boolean hasRole = userRoleService.userHasRole(userId, roleId);
        return ResponseEntity.ok(hasRole);
    }
}