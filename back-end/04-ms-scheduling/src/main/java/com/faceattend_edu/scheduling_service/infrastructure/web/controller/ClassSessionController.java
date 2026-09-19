package com.faceattend_edu.scheduling_service.infrastructure.web.controller;

import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.port.in.*;
import com.faceattend_edu.scheduling_service.infrastructure.web.dto.*;
import com.faceattend_edu.scheduling_service.infrastructure.web.mapper.ClassSessionWebMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/v1/class-sessions", "/class-sessions"})
@RequiredArgsConstructor
public class ClassSessionController {

    private final CreateClassSessionUseCase createUseCase;
    private final UpdateClassSessionUseCase updateUseCase;
    private final GetClassSessionUseCase getUseCase;
    private final ListClassSessionsUseCase listUseCase;
    private final DeleteClassSessionUseCase deleteUseCase;
    private final OpenClassSessionUseCase openUseCase;
    private final CloseClassSessionUseCase closeUseCase;
    private final CancelClassSessionUseCase cancelUseCase;
    private final ClassSessionWebMapper mapper;

    @GetMapping
    public ResponseEntity<List<ClassSessionResponse>> list(
            @RequestParam(required = false) Long scheduleBlockId) {
        List<ClassSessionResponse> list = listUseCase.list().stream()
                .filter(s -> scheduleBlockId == null || scheduleBlockId.equals(s.getScheduleBlockId()))
                .map(mapper::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<ClassSessionResponse> create(@Valid @RequestBody CreateClassSessionRequest req) {
        ClassSession created = createUseCase.create(mapper.toDomain(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassSessionResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(mapper.toResponse(getUseCase.getById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassSessionResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateClassSessionRequest req) {
        ClassSession updated = updateUseCase.update(id, mapper.toDomain(req));
        return ResponseEntity.ok(mapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deleteUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/open")
    public ResponseEntity<ClassSessionResponse> open(@PathVariable Long id, @RequestBody(required = false) Map<String,Object> body) {
        Long openedBy = null;
        if (body != null && body.get("openedBy") != null) {
            openedBy = Long.valueOf(body.get("openedBy").toString());
        }
        ClassSession opened = openUseCase.open(id, openedBy);
        return ResponseEntity.ok(mapper.toResponse(opened));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<ClassSessionResponse> close(@PathVariable Long id, @RequestBody(required = false) Map<String,Object> body) {
        Long closedBy = null;
        if (body != null && body.get("closedBy") != null) {
            closedBy = Long.valueOf(body.get("closedBy").toString());
        }
        ClassSession closed = closeUseCase.close(id, closedBy);
        return ResponseEntity.ok(mapper.toResponse(closed));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ClassSessionResponse> cancel(@PathVariable Long id) {
        ClassSession cancelled = cancelUseCase.cancel(id);
        return ResponseEntity.ok(mapper.toResponse(cancelled));
    }
}
