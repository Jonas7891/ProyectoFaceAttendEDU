package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.service.JustificationService;
import com.faceattend_edu.domain.dto.request.JustificationRequest;
import com.faceattend_edu.domain.dto.response.JustificationResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/justifications")
public class JustificationController {

    private final JustificationService justificationService;

    @GetMapping
    public ResponseEntity<List<JustificationResponse>> findAll() {
        return ResponseEntity.ok(justificationService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JustificationResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(justificationService.findById(id));
    }

    @PostMapping
    public ResponseEntity<JustificationResponse> save(@Valid @RequestBody JustificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(justificationService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JustificationResponse> update(@PathVariable Integer id, @Valid @RequestBody JustificationRequest request) {
        return ResponseEntity.ok(justificationService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        justificationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
