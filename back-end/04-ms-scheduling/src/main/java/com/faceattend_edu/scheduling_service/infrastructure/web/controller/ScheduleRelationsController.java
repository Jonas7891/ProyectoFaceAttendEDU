package com.faceattend_edu.scheduling_service.infrastructure.web.controller;

import com.faceattend_edu.scheduling_service.domain.model.ScheduleBlockFilter;
import com.faceattend_edu.scheduling_service.domain.port.in.ListClassSessionsUseCase;
import com.faceattend_edu.scheduling_service.domain.port.in.ListScheduleBlocksUseCase;
import com.faceattend_edu.scheduling_service.infrastructure.web.dto.ClassSessionResponse;
import com.faceattend_edu.scheduling_service.infrastructure.web.dto.ScheduleBlockResponse;
import com.faceattend_edu.scheduling_service.infrastructure.web.mapper.ClassSessionWebMapper;
import com.faceattend_edu.scheduling_service.infrastructure.web.mapper.ScheduleBlockWebMapper;
import com.faceattend_edu.scheduling_service.infrastructure.web.security.CallerSchoolContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

/** Nested read routes; each one is a filtered listing of the corresponding use case. */
@RestController
@RequiredArgsConstructor
public class ScheduleRelationsController {

    private final ListScheduleBlocksUseCase listBlocksUseCase;
    private final ListClassSessionsUseCase listSessionsUseCase;
    private final ScheduleBlockWebMapper blockMapper;
    private final ClassSessionWebMapper sessionMapper;

    @GetMapping("/api/v1/cohorts/{id}/blocks")
    public ResponseEntity<List<ScheduleBlockResponse>> blocksByCohort(@PathVariable Long id) {
        return blocks(ScheduleBlockFilter.byCohort(id));
    }

    @GetMapping("/api/v1/environments/{id}/blocks")
    public ResponseEntity<List<ScheduleBlockResponse>> blocksByEnvironment(@PathVariable Integer id) {
        return blocks(ScheduleBlockFilter.byEnvironment(id));
    }

    @GetMapping("/api/v1/actors/{id}/blocks")
    public ResponseEntity<List<ScheduleBlockResponse>> blocksByActor(@PathVariable Long id) {
        return blocks(ScheduleBlockFilter.byInstructor(id));
    }

    @GetMapping("/api/v1/blocks/{id}/sessions")
    public ResponseEntity<List<ClassSessionResponse>> sessionsByBlock(@PathVariable Long id) {
        return ResponseEntity.ok(listSessionsUseCase.listByBlock(CallerSchoolContext.caller(), id).stream()
                .map(sessionMapper::toResponse).toList());
    }

    private ResponseEntity<List<ScheduleBlockResponse>> blocks(ScheduleBlockFilter filter) {
        return ResponseEntity.ok(listBlocksUseCase.list(CallerSchoolContext.caller(), filter).stream()
                .map(blockMapper::toResponse).toList());
    }
}
