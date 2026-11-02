package com.faceattend_edu.scheduling_service.infrastructure.web.controller;

import com.faceattend_edu.scheduling_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.scheduling_service.domain.exception.ValidationException;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.model.Environment;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock;
import com.faceattend_edu.scheduling_service.domain.port.in.*;
import com.faceattend_edu.scheduling_service.infrastructure.web.Paging;
import com.faceattend_edu.scheduling_service.infrastructure.web.dto.*;
import com.faceattend_edu.scheduling_service.infrastructure.web.mapper.ClassSessionWebMapper;
import com.faceattend_edu.scheduling_service.infrastructure.web.security.CallerSchoolContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
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
    private final GetScheduleBlockUseCase getScheduleBlockUseCase;
    private final GetEnvironmentUseCase getEnvironmentUseCase;
    private final ClassSessionWebMapper mapper;

    /** class_session has no school_id either — it traces one through schedule_block -> environment. */
    private Integer schoolOf(ClassSession session) {
        if (session == null || session.getScheduleBlockId() == null) return null;
        ScheduleBlock block = getScheduleBlockUseCase.getById(session.getScheduleBlockId());
        if (block.getEnvironmentId() == null) return null;
        Environment environment = getEnvironmentUseCase.getById(block.getEnvironmentId());
        return environment.getSchoolId();
    }

    /**
     * Listing variant of {@link #schoolOf}: a session whose schedule_block (or its environment) was
     * soft-deleted resolves to no school, so a restricted caller's listing omits it instead of
     * failing the whole response with 404 (AUD-35). Logs ids only, no personal data.
     */
    private Integer schoolOfOrNull(ClassSession session) {
        try {
            return schoolOf(session);
        } catch (EntityNotFoundException e) {
            log.warn("Omitting orphan class_session {} from listing: its schedule_block or environment no longer exists",
                    session.getClassSessionId());
            return null;
        }
    }

    /** Skips the two-hop schedule_block/environment lookup entirely for an unrestricted caller. */
    private void requireAccess(ClassSession session) {
        if (CallerSchoolContext.restricted()) CallerSchoolContext.requireSchool(schoolOf(session));
    }

    /**
     * Any write on a class session is its instructor's job (or an administrator of the school's):
     * another instructor of the same school must not create, move, edit, delete, open, close or
     * cancel someone else's class. Answers 403: requireAccess runs first and already hides the
     * sessions of other schools behind a 404.
     */
    private void requireRunsClass(ClassSession session) {
        if (!CallerSchoolContext.restricted() || CallerSchoolContext.isSchoolAdmin()) return;
        Long own = CallerSchoolContext.ownActorId();
        ScheduleBlock block = session.getScheduleBlockId() == null ? null
                : getScheduleBlockUseCase.getById(session.getScheduleBlockId());
        if (own == null || block == null || !own.equals(block.getInstructorActorId())) {
            throw new CallerSchoolContext.NotClassInstructorException();
        }
    }

    @GetMapping
    public ResponseEntity<List<ClassSessionResponse>> list(
            @RequestParam(required = false) Long scheduleBlockId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String sessionStatus,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset) {
        boolean restricted = CallerSchoolContext.restricted();
        Integer ownSchoolId = restricted ? CallerSchoolContext.ownSchoolId() : null;
        Map<Long, Integer> schoolByBlock = new HashMap<>();
        List<ClassSessionResponse> list = listUseCase.list().stream()
                .filter(s -> scheduleBlockId == null || scheduleBlockId.equals(s.getScheduleBlockId()))
                .filter(s -> from == null || (s.getSessionDate() != null && !s.getSessionDate().isBefore(from)))
                .filter(s -> to == null || (s.getSessionDate() != null && !s.getSessionDate().isAfter(to)))
                .filter(s -> sessionStatus == null || sessionStatus.equalsIgnoreCase(s.getSessionStatus()))
                // Sin sede propia (restricted && ownSchoolId == null): falla seguro, nada.
                .filter(s -> !restricted || (ownSchoolId != null
                        && ownSchoolId.equals(schoolByBlock.computeIfAbsent(s.getScheduleBlockId(), id -> schoolOfOrNull(s)))))
                .map(mapper::toResponse).collect(Collectors.toList());
        return Paging.slice(list, limit, offset);
    }

    @PostMapping
    public ResponseEntity<ClassSessionResponse> create(@Valid @RequestBody CreateClassSessionRequest req) {
        ClassSession domain = mapper.toDomain(req);
        requireAccess(domain);
        requireRunsClass(domain);
        // A session is born Open and its opener is whoever creates it: neither the status nor
        // opened_by/opened_at come from the client (AUD-67). A Closed/Cancelled birth would leave
        // closed_by NULL (AUD-27); /close and /cancel are the only way to move on.
        if (!domain.isOpen()) {
            throw new ValidationException("A class session is created Open; use /close or /cancel to change its status");
        }
        Long caller = CallerSchoolContext.ownActorId();
        domain.setOpenedBy(caller);
        domain.setOpenedAt(caller == null ? null : Instant.now());
        ClassSession created = createUseCase.create(domain);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassSessionResponse> get(@PathVariable Long id) {
        ClassSession found = getUseCase.getById(id);
        requireAccess(found);
        return ResponseEntity.ok(mapper.toResponse(found));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassSessionResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateClassSessionRequest req) {
        ClassSession found = getUseCase.getById(id);
        requireAccess(found);
        requireRunsClass(found);
        ClassSession patch = mapper.toDomain(req);
        if (patch.getScheduleBlockId() != null) {
            requireAccess(patch);
            requireRunsClass(patch);
        }
        // The status moves only through /open, /close and /cancel, which stamp the acting actor.
        if (patch.getSessionStatus() != null && !patch.getSessionStatus().equals(found.getSessionStatus())) {
            throw new ValidationException("sessionStatus cannot be changed with PUT; use /open, /close or /cancel");
        }
        ClassSession updated = updateUseCase.update(id, patch);
        return ResponseEntity.ok(mapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ClassSession found = getUseCase.getById(id);
        requireAccess(found);
        requireRunsClass(found);
        deleteUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/open")
    public ResponseEntity<ClassSessionResponse> open(@PathVariable Long id) {
        ClassSession found = getUseCase.getById(id);
        requireAccess(found);
        requireRunsClass(found);
        // openedBy nunca viene del cliente (se podía falsificar): es el propio
        // academic_actor de quien llama, resuelto por el filtro de autenticación.
        ClassSession opened = openUseCase.open(id, CallerSchoolContext.ownActorId());
        return ResponseEntity.ok(mapper.toResponse(opened));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<ClassSessionResponse> close(@PathVariable Long id) {
        ClassSession found = getUseCase.getById(id);
        requireAccess(found);
        requireRunsClass(found);
        // closedBy: mismo criterio que open() — nunca confiar en el cliente.
        ClassSession closed = closeUseCase.close(id, CallerSchoolContext.ownActorId());
        return ResponseEntity.ok(mapper.toResponse(closed));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ClassSessionResponse> cancel(@PathVariable Long id) {
        ClassSession found = getUseCase.getById(id);
        requireAccess(found);
        requireRunsClass(found);
        ClassSession cancelled = cancelUseCase.cancel(id);
        return ResponseEntity.ok(mapper.toResponse(cancelled));
    }
}
