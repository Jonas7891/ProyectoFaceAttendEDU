package com.faceattend_edu.presentation.controller;

import com.faceattend_edu.application.service.ClassroomService;
import com.faceattend_edu.domain.dto.request.ClassroomRequest;
import com.faceattend_edu.domain.dto.response.ClassroomResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/classrooms")
public class ClassroomController {

    private final ClassroomService classroomService;

    @GetMapping
    public ResponseEntity<List<ClassroomResponse>> findAll() {
        return ResponseEntity.ok(classroomService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassroomResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(classroomService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ClassroomResponse> save(@Valid @RequestBody ClassroomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(classroomService.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassroomResponse> update(@PathVariable Integer id, @Valid @RequestBody ClassroomRequest request) {
        return ResponseEntity.ok(classroomService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        classroomService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
