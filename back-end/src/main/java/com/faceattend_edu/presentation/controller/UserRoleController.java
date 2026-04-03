package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.service.UserRoleService;
import com.faceattend_edu.domain.dto.request.UserRoleRequest;
import com.faceattend_edu.domain.dto.response.UserRoleResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/user-roles")
public class UserRoleController {

    private final UserRoleService userRoleService;

    @GetMapping
    public ResponseEntity<List<UserRoleResponse>> findAll() {
        return ResponseEntity.ok(userRoleService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserRoleResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(userRoleService.findById(id));
    }

    @PostMapping
    public ResponseEntity<UserRoleResponse> save(@Valid @RequestBody UserRoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userRoleService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserRoleResponse> update(@PathVariable Integer id, @Valid @RequestBody UserRoleRequest request) {
        return ResponseEntity.ok(userRoleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        userRoleService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
