package com.faceattend_edu.scheduling_service.infrastructure.web.controller;

import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.model.ClassSessionFilter;
import com.faceattend_edu.scheduling_service.domain.port.in.*;
import com.faceattend_edu.scheduling_service.infrastructure.web.Paging;
import com.faceattend_edu.scheduling_service.infrastructure.web.dto.*;
import com.faceattend_edu.scheduling_service.infrastructure.web.mapper.ClassSessionWebMapper;
import com.faceattend_edu.scheduling_service.infrastructure.web.security.CallerSchoolContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

/**
 * HTTP adapter for class sessions: it translates requests and responses only. Who may read or
 * change a session, its lifecycle and the server-stamped opened_by/closed_by are decided by the
 * use cases (application.access.SchedulingAccessPolicy and ClassSession).
 */
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
            @RequestParam(required = false) Long scheduleBlockId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String sessionStatus,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset) {
        ClassSessionFilter filter = new ClassSessionFilter(scheduleBlockId, from, to, sessionStatus);
        List<ClassSessionResponse> list = listUseCase.list(CallerSchoolContext.caller(), filter).stream()
                .map(mapper::toResponse).toList();
        return Paging.slice(list, limit, offset);
    }

    @PostMapping
    public ResponseEntity<ClassSessionResponse> create(@Valid @RequestBody CreateClassSessionRequest req) {
        ClassSession created = createUseCase.create(CallerSchoolContext.caller(), mapper.toDomain(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassSessionResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(mapper.toResponse(getUseCase.getById(CallerSchoolContext.caller(), id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassSessionResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateClassSessionRequest req) {
        ClassSession updated = updateUseCase.update(CallerSchoolContext.caller(), id, mapper.toDomain(req));
        return ResponseEntity.ok(mapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deleteUseCase.delete(CallerSchoolContext.caller(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/open")
    public ResponseEntity<ClassSessionResponse> open(@PathVariable Long id) {
        return ResponseEntity.ok(mapper.toResponse(openUseCase.open(CallerSchoolContext.caller(), id)));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<ClassSessionResponse> close(@PathVariable Long id) {
        return ResponseEntity.ok(mapper.toResponse(closeUseCase.close(CallerSchoolContext.caller(), id)));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ClassSessionResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(mapper.toResponse(cancelUseCase.cancel(CallerSchoolContext.caller(), id)));
    }
}
