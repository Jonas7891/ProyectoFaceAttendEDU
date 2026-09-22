package com.faceattend_edu.scheduling_service.infrastructure.web.controller;

import com.faceattend_edu.scheduling_service.domain.port.in.ListClassSessionsUseCase;
import com.faceattend_edu.scheduling_service.domain.port.in.ListScheduleBlocksUseCase;
import com.faceattend_edu.scheduling_service.infrastructure.web.dto.ClassSessionResponse;
import com.faceattend_edu.scheduling_service.infrastructure.web.dto.ScheduleBlockResponse;
import com.faceattend_edu.scheduling_service.infrastructure.web.mapper.ClassSessionWebMapper;
import com.faceattend_edu.scheduling_service.infrastructure.web.mapper.ScheduleBlockWebMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class ScheduleRelationsController {

    private final ListScheduleBlocksUseCase listBlocksUseCase;
    private final ListClassSessionsUseCase listSessionsUseCase;
    private final ScheduleBlockWebMapper blockMapper;
    private final ClassSessionWebMapper sessionMapper;

    @GetMapping("/api/v1/cohorts/{id}/blocks")
    public ResponseEntity<List<ScheduleBlockResponse>> blocksByCohort(@PathVariable Long id) {
        return ResponseEntity.ok(listBlocksUseCase.list().stream()
                .filter(b -> id.equals(b.getCohortId()))
                .map(blockMapper::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/api/v1/environments/{id}/blocks")
    public ResponseEntity<List<ScheduleBlockResponse>> blocksByEnvironment(@PathVariable Integer id) {
        return ResponseEntity.ok(listBlocksUseCase.list().stream()
                .filter(b -> id.equals(b.getEnvironmentId()))
                .map(blockMapper::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/api/v1/actors/{id}/blocks")
    public ResponseEntity<List<ScheduleBlockResponse>> blocksByActor(@PathVariable Long id) {
        return ResponseEntity.ok(listBlocksUseCase.list().stream()
                .filter(b -> id.equals(b.getInstructorActorId()))
                .map(blockMapper::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/api/v1/blocks/{id}/sessions")
    public ResponseEntity<List<ClassSessionResponse>> sessionsByBlock(@PathVariable Long id) {
        return ResponseEntity.ok(listSessionsUseCase.list().stream()
                .filter(s -> id.equals(s.getScheduleBlockId()))
                .map(sessionMapper::toResponse).collect(Collectors.toList()));
    }
}
