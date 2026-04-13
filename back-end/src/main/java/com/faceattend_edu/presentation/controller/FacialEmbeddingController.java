package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.service.FacialEmbeddingService;
import com.faceattend_edu.domain.dto.request.FacialEmbeddingRequest;
import com.faceattend_edu.domain.dto.response.FacialEmbeddingResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/facial-embeddings")
public class FacialEmbeddingController {

    private final FacialEmbeddingService facialEmbeddingService;

    @GetMapping
    public ResponseEntity<List<FacialEmbeddingResponse>> findAll() {
        return ResponseEntity.ok(facialEmbeddingService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacialEmbeddingResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(facialEmbeddingService.findById(id));
    }

    @PostMapping
    public ResponseEntity<FacialEmbeddingResponse> save(@Valid @RequestBody FacialEmbeddingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(facialEmbeddingService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FacialEmbeddingResponse> update(@PathVariable Integer id, @Valid @RequestBody FacialEmbeddingRequest request) {
        return ResponseEntity.ok(facialEmbeddingService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        facialEmbeddingService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
