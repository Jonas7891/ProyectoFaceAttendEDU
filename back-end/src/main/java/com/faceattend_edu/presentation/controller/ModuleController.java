package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.service.ModuleService;
import com.faceattend_edu.domain.dto.request.ModuleRequest;
import com.faceattend_edu.domain.dto.response.ModuleResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/modules")
public class ModuleController {

    private final ModuleService moduleService;

    @GetMapping
    public ResponseEntity<List<ModuleResponse>> findAll() {
        return ResponseEntity.ok(moduleService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModuleResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(moduleService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ModuleResponse> save(@Valid @RequestBody ModuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(moduleService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ModuleResponse> update(@PathVariable Integer id, @Valid @RequestBody ModuleRequest request) {
        return ResponseEntity.ok(moduleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        moduleService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
