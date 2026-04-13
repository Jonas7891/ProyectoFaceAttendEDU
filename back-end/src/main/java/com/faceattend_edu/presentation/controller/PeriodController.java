package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.service.PeriodService;
import com.faceattend_edu.domain.dto.request.PeriodRequest;
import com.faceattend_edu.domain.dto.response.PeriodResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/periods")
public class PeriodController {

    private final PeriodService periodService;

    @GetMapping
    public ResponseEntity<List<PeriodResponse>> findAll() {
        return ResponseEntity.ok(periodService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PeriodResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(periodService.findById(id));
    }

    @PostMapping
    public ResponseEntity<PeriodResponse> save(@Valid @RequestBody PeriodRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(periodService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PeriodResponse> update(@PathVariable Integer id, @Valid @RequestBody PeriodRequest request) {
        return ResponseEntity.ok(periodService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        periodService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
