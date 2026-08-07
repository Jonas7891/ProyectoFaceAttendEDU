package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.service.SchoolService;
import com.faceattend_edu.domain.dto.request.SchoolRequest;
import com.faceattend_edu.domain.dto.response.SchoolResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/schools")
public class SchoolController {

    private final SchoolService schoolService;

    @GetMapping
    public ResponseEntity<List<SchoolResponse>> findAll() {
        return ResponseEntity.ok(schoolService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SchoolResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(schoolService.findById(id));
    }

    @PostMapping
    public ResponseEntity<SchoolResponse> save(@Valid @RequestBody SchoolRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(schoolService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SchoolResponse> update(@PathVariable Integer id, @Valid @RequestBody SchoolRequest request) {
        return ResponseEntity.ok(schoolService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        schoolService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
