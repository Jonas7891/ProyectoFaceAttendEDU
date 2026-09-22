package com.faceattend_edu.scheduling_service.infrastructure.web.controller;

import com.faceattend_edu.scheduling_service.domain.model.Environment;
import com.faceattend_edu.scheduling_service.domain.port.in.*;
import com.faceattend_edu.scheduling_service.infrastructure.web.dto.*;
import com.faceattend_edu.scheduling_service.infrastructure.web.mapper.EnvironmentWebMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/v1/environments", "/environments"})
@RequiredArgsConstructor
public class EnvironmentController {

    private final CreateEnvironmentUseCase createUseCase;
    private final UpdateEnvironmentUseCase updateUseCase;
    private final GetEnvironmentUseCase getUseCase;
    private final ListEnvironmentsUseCase listUseCase;
    private final DeleteEnvironmentUseCase deleteUseCase;
    private final EnvironmentWebMapper mapper;

    @GetMapping
    public ResponseEntity<List<EnvironmentResponse>> list(@RequestParam(required = false) Integer schoolId) {
        List<Environment> list = schoolId != null ? listUseCase.listBySchoolId(schoolId) : listUseCase.list();
        return ResponseEntity.ok(list.stream().map(mapper::toResponse).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<EnvironmentResponse> create(@Valid @RequestBody CreateEnvironmentRequest req) {
        Environment created = createUseCase.create(mapper.toDomain(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnvironmentResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(mapper.toResponse(getUseCase.getById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EnvironmentResponse> update(@PathVariable Integer id, @Valid @RequestBody UpdateEnvironmentRequest req) {
        Environment updated = updateUseCase.update(id, mapper.toDomain(req));
        return ResponseEntity.ok(mapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        deleteUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }
}
