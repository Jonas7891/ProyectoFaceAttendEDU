package com.faceattend_edu.attendance_service.application.usecase;

import com.faceattend_edu.attendance_service.domain.exception.DuplicateEntityException;
import com.faceattend_edu.attendance_service.domain.model.JustificationType;
import com.faceattend_edu.attendance_service.domain.port.in.CreateJustificationTypeUseCase;
import com.faceattend_edu.attendance_service.domain.port.out.JustificationTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateJustificationTypeUseCaseImpl implements CreateJustificationTypeUseCase {
    private final JustificationTypeRepository repository;
    @Override public JustificationType create(JustificationType type){
        type.validate(); type.touchCreated();
        repository.findByName(type.getName()).ifPresent(t -> { throw new DuplicateEntityException("JustificationType already exists with name=" + type.getName()); });
        try { return repository.save(type); } catch (DataIntegrityViolationException ex){ throw new DuplicateEntityException("JustificationType duplicate violates unique constraint", ex); }
    }
}
