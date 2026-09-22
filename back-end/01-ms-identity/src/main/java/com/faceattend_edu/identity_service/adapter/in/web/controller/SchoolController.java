package com.faceattend_edu.identity_service.adapter.in.web.controller;

import com.faceattend_edu.identity_service.adapter.in.web.dto.SchoolDto;
import com.faceattend_edu.identity_service.adapter.in.web.mapper.SchoolWebMapper;
import com.faceattend_edu.identity_service.application.port.in.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final CreateSchoolUseCase createSchoolUseCase;
    private final GetSchoolUseCase getSchoolUseCase;
    private final UpdateSchoolUseCase updateSchoolUseCase;
    private final ChangeSchoolStatusUseCase changeSchoolStatusUseCase;
    private final SchoolWebMapper schoolWebMapper;

    @PostMapping
    public ResponseEntity<SchoolDto> createSchool(@RequestBody SchoolDto schoolDto) {
        return ResponseEntity.ok(schoolWebMapper.toDto(createSchoolUseCase.createSchool(schoolWebMapper.toDomain(schoolDto))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SchoolDto> getSchool(@PathVariable UUID id) {
        return ResponseEntity.ok(schoolWebMapper.toDto(getSchoolUseCase.getSchool(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateSchool(@PathVariable UUID id, @RequestBody SchoolDto schoolDto) {
        schoolDto.setSchoolId(id);
        updateSchoolUseCase.updateSchool(schoolWebMapper.toDomain(schoolDto));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> changeStatus(@PathVariable UUID id, @RequestParam boolean status) {
        changeSchoolStatusUseCase.changeStatus(id, status);
        return ResponseEntity.noContent().build();
    }
}
