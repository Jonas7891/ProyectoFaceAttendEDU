package com.faceattend_edu.scheduling_service.infrastructure.web.controller;

import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock;
import com.faceattend_edu.scheduling_service.domain.port.in.*;
import com.faceattend_edu.scheduling_service.infrastructure.web.dto.*;
import com.faceattend_edu.scheduling_service.infrastructure.web.mapper.ScheduleBlockWebMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/v1/schedule-blocks", "/schedule-blocks"})
@RequiredArgsConstructor
public class ScheduleBlockController {

    private final CreateScheduleBlockUseCase createUseCase;
    private final UpdateScheduleBlockUseCase updateUseCase;
    private final GetScheduleBlockUseCase getUseCase;
    private final ListScheduleBlocksUseCase listUseCase;
    private final DeleteScheduleBlockUseCase deleteUseCase;
    private final ScheduleBlockWebMapper mapper;

    @GetMapping
    public ResponseEntity<List<ScheduleBlockResponse>> list(
            @RequestParam(required = false) Long cohortId,
            @RequestParam(required = false) Integer environmentId,
            @RequestParam(required = false) Long instructorActorId,
            @RequestParam(required = false) Integer courseId) {
        List<ScheduleBlockResponse> list = listUseCase.list().stream()
                .filter(b -> cohortId == null || cohortId.equals(b.getCohortId()))
                .filter(b -> environmentId == null || environmentId.equals(b.getEnvironmentId()))
                .filter(b -> instructorActorId == null || instructorActorId.equals(b.getInstructorActorId()))
                .filter(b -> courseId == null || courseId.equals(b.getCourseId()))
                .map(mapper::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<ScheduleBlockResponse> create(@Valid @RequestBody CreateScheduleBlockRequest req) {
        ScheduleBlock created = createUseCase.create(mapper.toDomain(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScheduleBlockResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(mapper.toResponse(getUseCase.getById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScheduleBlockResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateScheduleBlockRequest req) {
        ScheduleBlock updated = updateUseCase.update(id, mapper.toDomain(req));
        return ResponseEntity.ok(mapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deleteUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }
}
