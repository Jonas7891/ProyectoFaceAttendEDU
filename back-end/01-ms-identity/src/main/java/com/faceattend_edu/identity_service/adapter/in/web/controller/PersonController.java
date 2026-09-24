package com.faceattend_edu.identity_service.adapter.in.web.controller;

import com.faceattend_edu.identity_service.adapter.in.web.dto.PageResponse;
import com.faceattend_edu.identity_service.adapter.in.web.dto.PersonDto;
import com.faceattend_edu.identity_service.adapter.in.web.mapper.PersonWebMapper;
import com.faceattend_edu.identity_service.application.port.in.ChangePersonStatusUseCase;
import com.faceattend_edu.identity_service.application.port.in.CreatePersonUseCase;
import com.faceattend_edu.identity_service.application.port.in.GetPersonUseCase;
import com.faceattend_edu.identity_service.application.port.in.ListPersonsUseCase;
import com.faceattend_edu.identity_service.application.port.in.UpdatePersonUseCase;
import com.faceattend_edu.identity_service.domain.model.Person;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/persons")
@RequiredArgsConstructor
public class PersonController {

    private final CreatePersonUseCase createPersonUseCase;
    private final GetPersonUseCase getPersonUseCase;
    private final ListPersonsUseCase listPersonsUseCase;
    private final UpdatePersonUseCase updatePersonUseCase;
    private final ChangePersonStatusUseCase changePersonStatusUseCase;
    private final PersonWebMapper personWebMapper;

    @PostMapping
    public ResponseEntity<PersonDto> createPerson(@Valid @RequestBody PersonDto personDto) {
        Person created = createPersonUseCase.createPerson(personWebMapper.toDomain(personDto));
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.getPersonId()).toUri();
        return ResponseEntity.created(location).body(personWebMapper.toDto(created));
    }

    @GetMapping
    public ResponseEntity<PageResponse<PersonDto>> listPersons(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer limit) {
        List<PersonDto> all = listPersonsUseCase.listPersons().stream()
                .map(personWebMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(PageResponse.of(all, page, limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonDto> getPerson(@PathVariable UUID id) {
        return ResponseEntity.ok(personWebMapper.toDto(getPersonUseCase.getPerson(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonDto> updatePerson(@PathVariable UUID id, @Valid @RequestBody PersonDto personDto) {
        personDto.setPersonId(id);
        updatePersonUseCase.updatePerson(id, personWebMapper.toDomain(personDto));
        return ResponseEntity.ok(personWebMapper.toDto(getPersonUseCase.getPerson(id)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> changeStatus(@PathVariable UUID id, @RequestParam boolean status) {
        changePersonStatusUseCase.changeStatus(id, status);
        return ResponseEntity.noContent().build();
    }
}
