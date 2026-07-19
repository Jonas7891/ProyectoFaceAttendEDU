package com.faceattend_edu.util.presentation;

import com.faceattend_edu.util.application.AbstractService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public abstract class AbstractController<Response, Request, ID> {

    // ── Hook ──────────────────────────────────────────────────────────────────

    protected abstract AbstractService<Request, Response, ID> getService();

    // ── Endpoints genéricos ───────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Response>> findAll() {
        return ResponseEntity.ok(getService().findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> findById(@PathVariable ID id) {
        return ResponseEntity.ok(getService().findById(id));
    }

    @PostMapping
    public ResponseEntity<Response> save(@Valid @RequestBody Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(getService().save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Response> update(@PathVariable ID id,
                                           @Valid @RequestBody Request request) {
        return ResponseEntity.ok(getService().update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable ID id) {
        getService().deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
