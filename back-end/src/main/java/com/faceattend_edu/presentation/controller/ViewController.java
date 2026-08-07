package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.service.ViewService;
import com.faceattend_edu.domain.dto.request.ViewRequest;
import com.faceattend_edu.domain.dto.response.ViewResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/views")
public class ViewController {

    private final ViewService viewService;

    @GetMapping
    public ResponseEntity<List<ViewResponse>> findAll() {
        return ResponseEntity.ok(viewService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ViewResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(viewService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ViewResponse> save(@Valid @RequestBody ViewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(viewService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ViewResponse> update(@PathVariable Integer id, @Valid @RequestBody ViewRequest request) {
        return ResponseEntity.ok(viewService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        viewService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
