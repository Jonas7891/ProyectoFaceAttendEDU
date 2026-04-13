package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.service.ActionService;
import com.faceattend_edu.domain.dto.request.ActionRequest;
import com.faceattend_edu.domain.dto.response.ActionResponse;
import com.faceattend_edu.domain.model.Action;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/actions")
public class ActionController {

    private final ActionService actionService;

    @GetMapping
    public ResponseEntity<List<ActionResponse>> findAll() {
        return ResponseEntity.ok(actionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActionResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(actionService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ActionResponse> save(@Valid @RequestBody ActionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(actionService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActionResponse> update(@PathVariable Integer id, @Valid @RequestBody ActionRequest request) {
        return ResponseEntity.ok(actionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        actionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
