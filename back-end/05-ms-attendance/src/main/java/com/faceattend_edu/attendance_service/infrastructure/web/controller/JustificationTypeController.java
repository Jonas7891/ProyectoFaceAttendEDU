package com.faceattend_edu.attendance_service.infrastructure.web.controller;

import com.faceattend_edu.attendance_service.domain.model.JustificationType;
import com.faceattend_edu.attendance_service.domain.port.in.*;
import com.faceattend_edu.attendance_service.infrastructure.web.dto.*;
import com.faceattend_edu.attendance_service.infrastructure.web.mapper.JustificationTypeWebMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/v1/justification-types", "/justification-types"})
@RequiredArgsConstructor
public class JustificationTypeController {
    private final CreateJustificationTypeUseCase createUseCase;
    private final UpdateJustificationTypeUseCase updateUseCase;
    private final GetJustificationTypeUseCase getUseCase;
    private final ListJustificationTypesUseCase listUseCase;
    private final DeleteJustificationTypeUseCase deleteUseCase;
    private final JustificationTypeWebMapper mapper;

    @GetMapping
    public ResponseEntity<List<JustificationTypeResponse>> list(){
        List<JustificationTypeResponse> list = listUseCase.list().stream().map(mapper::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<JustificationTypeResponse> create(@Valid @RequestBody CreateJustificationTypeRequest req){
        JustificationType created = createUseCase.create(mapper.toDomain(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JustificationTypeResponse> get(@PathVariable Integer id){
        return ResponseEntity.ok(mapper.toResponse(getUseCase.getById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JustificationTypeResponse> update(@PathVariable Integer id, @Valid @RequestBody UpdateJustificationTypeRequest req){
        JustificationType updated = updateUseCase.update(id, mapper.toDomain(req));
        return ResponseEntity.ok(mapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id){
        deleteUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }
}
