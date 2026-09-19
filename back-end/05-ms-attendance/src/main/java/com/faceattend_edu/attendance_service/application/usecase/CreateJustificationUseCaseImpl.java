package com.faceattend_edu.attendance_service.application.usecase;

import com.faceattend_edu.attendance_service.domain.exception.DuplicateEntityException;
import com.faceattend_edu.attendance_service.domain.model.Justification;
import com.faceattend_edu.attendance_service.domain.port.in.CreateJustificationUseCase;
import com.faceattend_edu.attendance_service.domain.port.out.JustificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateJustificationUseCaseImpl implements CreateJustificationUseCase {
    private final JustificationRepository repository;
    @Override public Justification create(Justification j){
        j.validate(); j.touchCreated();
        repository.findByAttendanceRecordId(j.getAttendanceRecordId()).ifPresent(existing -> { throw new DuplicateEntityException("Justification already exists for attendanceRecordId=" + j.getAttendanceRecordId()); });
        try { return repository.save(j); } catch (DataIntegrityViolationException ex){ throw new DuplicateEntityException("Justification duplicate violates unique constraint (attendance_record_id)", ex); }
    }
}
