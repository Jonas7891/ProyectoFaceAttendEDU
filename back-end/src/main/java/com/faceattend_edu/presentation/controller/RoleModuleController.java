package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.service.RoleModuleService;
import com.faceattend_edu.domain.dto.request.RoleModuleRequest;
import com.faceattend_edu.domain.dto.response.RoleModuleResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/role-modules")
public class RoleModuleController {

    private final RoleModuleService roleModuleService;

    @GetMapping
    public ResponseEntity<List<RoleModuleResponse>> findAll() {
        return ResponseEntity.ok(roleModuleService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleModuleResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(roleModuleService.findById(id));
    }

    @PostMapping
    public ResponseEntity<RoleModuleResponse> save(@Valid @RequestBody RoleModuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roleModuleService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleModuleResponse> update(@PathVariable Integer id, @Valid @RequestBody RoleModuleRequest request) {
        return ResponseEntity.ok(roleModuleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        roleModuleService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
