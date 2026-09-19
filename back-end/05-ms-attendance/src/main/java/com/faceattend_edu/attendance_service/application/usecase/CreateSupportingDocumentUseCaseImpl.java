package com.faceattend_edu.attendance_service.application.usecase;

import com.faceattend_edu.attendance_service.domain.model.SupportingDocument;
import com.faceattend_edu.attendance_service.domain.port.in.CreateSupportingDocumentUseCase;
import com.faceattend_edu.attendance_service.domain.port.out.SupportingDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateSupportingDocumentUseCaseImpl implements CreateSupportingDocumentUseCase {
    private final SupportingDocumentRepository repository;
    @Override public SupportingDocument create(SupportingDocument doc){ doc.validate(); doc.touchCreated(); return repository.save(doc); }
}
