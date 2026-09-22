package com.faceattend_edu.attendance_service.infrastructure.web.controller;

import com.faceattend_edu.attendance_service.domain.model.SupportingDocument;
import com.faceattend_edu.attendance_service.domain.port.in.*;
import com.faceattend_edu.attendance_service.infrastructure.web.dto.*;
import com.faceattend_edu.attendance_service.infrastructure.web.mapper.SupportingDocumentWebMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/v1/supporting-documents", "/supporting-documents"})
@RequiredArgsConstructor
public class SupportingDocumentController {
    private final CreateSupportingDocumentUseCase createUseCase;
    private final GetSupportingDocumentUseCase getUseCase;
    private final ListSupportingDocumentsUseCase listUseCase;
    private final DeleteSupportingDocumentUseCase deleteUseCase;
    private final SupportingDocumentWebMapper mapper;

    @GetMapping
    public ResponseEntity<List<SupportingDocumentResponse>> list(@RequestParam(required = false) Long justificationId){
        List<SupportingDocument> list;
        if (justificationId != null) list = listUseCase.listByJustificationId(justificationId);
        else list = listUseCase.list();
        return ResponseEntity.ok(list.stream().map(mapper::toResponse).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<SupportingDocumentResponse> create(@Valid @RequestBody CreateSupportingDocumentRequest req){
        SupportingDocument created = createUseCase.create(mapper.toDomain(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportingDocumentResponse> get(@PathVariable Long id){
        return ResponseEntity.ok(mapper.toResponse(getUseCase.getById(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        deleteUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }
}
