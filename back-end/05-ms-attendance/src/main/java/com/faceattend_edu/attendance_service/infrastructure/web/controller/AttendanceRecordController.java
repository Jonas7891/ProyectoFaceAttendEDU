package com.faceattend_edu.attendance_service.infrastructure.web.controller;

import com.faceattend_edu.attendance_service.domain.model.AttendanceRecord;
import com.faceattend_edu.attendance_service.domain.port.in.*;
import com.faceattend_edu.attendance_service.infrastructure.web.dto.*;
import com.faceattend_edu.attendance_service.infrastructure.web.mapper.AttendanceRecordWebMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/v1/attendance-records", "/attendance-records"})
@RequiredArgsConstructor
public class AttendanceRecordController {
    private final CreateAttendanceRecordUseCase createUseCase;
    private final UpdateAttendanceRecordUseCase updateUseCase;
    private final GetAttendanceRecordUseCase getUseCase;
    private final ListAttendanceRecordsUseCase listUseCase;
    private final DeleteAttendanceRecordUseCase deleteUseCase;
    private final BulkRecordAttendanceUseCase bulkUseCase;
    private final AttendanceRecordWebMapper mapper;

    @GetMapping
    public ResponseEntity<List<AttendanceRecordResponse>> list(
            @RequestParam(required = false) Long classSessionId,
            @RequestParam(required = false) Long academicActorId,
            @RequestParam(required = false) String attendanceStatus){
        List<AttendanceRecordResponse> list = listUseCase.list().stream()
                .filter(r -> classSessionId == null || classSessionId.equals(r.getClassSessionId()))
                .filter(r -> academicActorId == null || academicActorId.equals(r.getAcademicActorId()))
                .filter(r -> attendanceStatus == null || attendanceStatus.equals(r.getAttendanceStatus()))
                .map(mapper::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<AttendanceRecordResponse> create(@Valid @RequestBody CreateAttendanceRecordRequest req){
        AttendanceRecord created = createUseCase.create(mapper.toDomain(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<AttendanceRecordResponse>> bulk(@Valid @RequestBody List<CreateAttendanceRecordRequest> reqs){
        List<AttendanceRecord> domains = reqs.stream().map(mapper::toDomain).collect(Collectors.toList());
        List<AttendanceRecordResponse> saved = bulkUseCase.bulk(domains).stream().map(mapper::toResponse).collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceRecordResponse> get(@PathVariable Long id){
        return ResponseEntity.ok(mapper.toResponse(getUseCase.getById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceRecordResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateAttendanceRecordRequest req){
        AttendanceRecord updated = updateUseCase.update(id, mapper.toDomain(req));
        return ResponseEntity.ok(mapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        deleteUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }
}
