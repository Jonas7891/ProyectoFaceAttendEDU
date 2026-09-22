package com.faceattend_edu.identity_service.adapter.in.web.controller;

import com.faceattend_edu.identity_service.adapter.in.web.dto.PersonDto;
import com.faceattend_edu.identity_service.adapter.in.web.mapper.PersonWebMapper;
import com.faceattend_edu.identity_service.application.port.in.ChangePersonStatusUseCase;
import com.faceattend_edu.identity_service.application.port.in.CreatePersonUseCase;
import com.faceattend_edu.identity_service.application.port.in.GetPersonUseCase;
import com.faceattend_edu.identity_service.application.port.in.TransferPersonUseCase;
import com.faceattend_edu.identity_service.application.port.in.UpdatePersonUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/persons")
@RequiredArgsConstructor
public class PersonController {

    private final CreatePersonUseCase createPersonUseCase;
    private final GetPersonUseCase getPersonUseCase;
    private final UpdatePersonUseCase updatePersonUseCase;
    private final ChangePersonStatusUseCase changePersonStatusUseCase;
    private final TransferPersonUseCase transferPersonUseCase;
    private final PersonWebMapper personWebMapper;

    @PostMapping
    public ResponseEntity<PersonDto> createPerson(@RequestBody PersonDto personDto) {
        return ResponseEntity.ok(personWebMapper.toDto(createPersonUseCase.createPerson(personWebMapper.toDomain(personDto))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonDto> getPerson(@PathVariable UUID id) {
        return ResponseEntity.ok(personWebMapper.toDto(getPersonUseCase.getPerson(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePerson(@PathVariable UUID id, @RequestBody PersonDto personDto) {
        personDto.setPersonId(id);
        updatePersonUseCase.updatePerson(personWebMapper.toDomain(personDto));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/transfer")
    public ResponseEntity<Void> transferPerson(@PathVariable UUID id, @RequestBody Map<String, UUID> body) {
        transferPersonUseCase.transferPerson(id, body.get("newSchoolId"));
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> changeStatus(@PathVariable UUID id, @RequestParam boolean status) {
        changePersonStatusUseCase.changeStatus(id, status);
        return ResponseEntity.noContent().build();
    }
}
