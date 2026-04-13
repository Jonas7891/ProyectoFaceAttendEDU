package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.service.ViewModuleService;
import com.faceattend_edu.domain.dto.request.ViewModuleRequest;
import com.faceattend_edu.domain.dto.response.ViewModuleResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/view-modules")
public class ViewModuleController {

    private final ViewModuleService viewModuleService;

    @GetMapping
    public ResponseEntity<List<ViewModuleResponse>> findAll() {
        return ResponseEntity.ok(viewModuleService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ViewModuleResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(viewModuleService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ViewModuleResponse> save(@Valid @RequestBody ViewModuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(viewModuleService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ViewModuleResponse> update(@PathVariable Integer id, @Valid @RequestBody ViewModuleRequest request) {
        return ResponseEntity.ok(viewModuleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        viewModuleService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
