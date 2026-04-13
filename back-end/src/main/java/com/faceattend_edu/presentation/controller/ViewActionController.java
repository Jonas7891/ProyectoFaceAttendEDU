package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.service.ViewActionService;
import com.faceattend_edu.domain.dto.request.ViewActionRequest;
import com.faceattend_edu.domain.dto.response.ViewActionResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/view-actions")
public class ViewActionController {

    private final ViewActionService viewActionService;

    @GetMapping
    public ResponseEntity<List<ViewActionResponse>> findAll() {
        return ResponseEntity.ok(viewActionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ViewActionResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(viewActionService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ViewActionResponse> save(@Valid @RequestBody ViewActionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(viewActionService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ViewActionResponse> update(@PathVariable Integer id, @Valid @RequestBody ViewActionRequest request) {
        return ResponseEntity.ok(viewActionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        viewActionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
