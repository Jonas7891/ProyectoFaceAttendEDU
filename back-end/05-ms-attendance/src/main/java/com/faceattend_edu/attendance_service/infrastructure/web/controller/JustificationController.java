package com.faceattend_edu.attendance_service.infrastructure.web.controller;

import com.faceattend_edu.attendance_service.domain.model.Justification;
import com.faceattend_edu.attendance_service.domain.port.in.*;
import com.faceattend_edu.attendance_service.infrastructure.web.dto.*;
import com.faceattend_edu.attendance_service.infrastructure.web.mapper.JustificationWebMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/v1/justifications", "/justifications"})
@RequiredArgsConstructor
public class JustificationController {
    private final CreateJustificationUseCase createUseCase;
    private final ReviewJustificationUseCase reviewUseCase;
    private final GetJustificationUseCase getUseCase;
    private final ListJustificationsUseCase listUseCase;
    private final DeleteJustificationUseCase deleteUseCase;
    private final JustificationWebMapper mapper;

    @GetMapping
    public ResponseEntity<List<JustificationResponse>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long attendanceRecordId){
        List<JustificationResponse> list = listUseCase.list().stream()
                .filter(j -> status == null || status.equals(j.getReviewStatus()))
                .filter(j -> attendanceRecordId == null || attendanceRecordId.equals(j.getAttendanceRecordId()))
                .map(mapper::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<JustificationResponse> create(@Valid @RequestBody CreateJustificationRequest req){
        Justification created = createUseCase.create(mapper.toDomain(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JustificationResponse> get(@PathVariable Long id){
        return ResponseEntity.ok(mapper.toResponse(getUseCase.getById(id)));
    }

    @PatchMapping("/{id}/review")
    public ResponseEntity<JustificationResponse> review(@PathVariable Long id, @Valid @RequestBody ReviewJustificationRequest req){
        Justification reviewed = reviewUseCase.review(id, req.getReviewStatus(), req.getReviewedBy(), req.getResolutionNotes());
        return ResponseEntity.ok(mapper.toResponse(reviewed));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        deleteUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }
}
