package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.service.LanguageService;
import com.faceattend_edu.domain.dto.request.LanguageRequest;
import com.faceattend_edu.domain.dto.response.LanguageResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/languages")
public class LanguageController {

    private final LanguageService languageService;

    @GetMapping
    public ResponseEntity<List<LanguageResponse>> findAll() {
        return ResponseEntity.ok(languageService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LanguageResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(languageService.findById(id));
    }

    @PostMapping
    public ResponseEntity<LanguageResponse> save(@Valid @RequestBody LanguageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(languageService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LanguageResponse> update(@PathVariable Integer id, @Valid @RequestBody LanguageRequest request) {
        return ResponseEntity.ok(languageService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        languageService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
