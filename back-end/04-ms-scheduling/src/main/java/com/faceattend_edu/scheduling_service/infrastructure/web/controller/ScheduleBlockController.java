package com.faceattend_edu.scheduling_service.infrastructure.web.controller;

import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlock;
import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlockFilter;
import com.faceattend_edu.scheduling_service.domain.port.in.*;
import com.faceattend_edu.scheduling_service.infrastructure.web.Paging;
import com.faceattend_edu.scheduling_service.infrastructure.web.dto.*;
import com.faceattend_edu.scheduling_service.infrastructure.web.mapper.ScheduleBlockWebMapper;
import com.faceattend_edu.scheduling_service.infrastructure.web.security.CallerSchoolContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/** HTTP adapter for schedule blocks; the school scope is applied by the use cases. */
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
            @RequestParam(required = false) Integer courseId,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset) {
        ScheduleBlockFilter filter = new ScheduleBlockFilter(cohortId, environmentId, instructorActorId, courseId);
        List<ScheduleBlockResponse> list = listUseCase.list(CallerSchoolContext.caller(), filter).stream()
                .map(mapper::toResponse).toList();
        return Paging.slice(list, limit, offset);
    }

    @PostMapping
    public ResponseEntity<ScheduleBlockResponse> create(@Valid @RequestBody CreateScheduleBlockRequest req) {
        ScheduleBlock created = createUseCase.create(CallerSchoolContext.caller(), mapper.toDomain(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScheduleBlockResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(mapper.toResponse(getUseCase.getById(CallerSchoolContext.caller(), id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScheduleBlockResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateScheduleBlockRequest req) {
        ScheduleBlock updated = updateUseCase.update(CallerSchoolContext.caller(), id, mapper.toDomain(req));
        return ResponseEntity.ok(mapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deleteUseCase.delete(CallerSchoolContext.caller(), id);
        return ResponseEntity.noContent().build();
    }
}
