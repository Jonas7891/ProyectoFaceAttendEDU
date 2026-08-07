package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.service.LogService;
import com.faceattend_edu.domain.dto.request.LogRequest;
import com.faceattend_edu.domain.dto.response.LogResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/logs")
public class LogController {

    private final LogService logService;

    @GetMapping
    public ResponseEntity<List<LogResponse>> findAll() {
        return ResponseEntity.ok(logService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LogResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(logService.findById(id));
    }

    @PostMapping
    public ResponseEntity<LogResponse> save(@Valid @RequestBody LogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(logService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LogResponse> update(@PathVariable Integer id, @Valid @RequestBody LogRequest request) {
        return ResponseEntity.ok(logService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        logService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
