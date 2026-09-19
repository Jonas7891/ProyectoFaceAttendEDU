package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.domain.exception.DuplicateEntityException;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.port.in.CreateClassSessionUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.ClassSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateClassSessionUseCaseImpl implements CreateClassSessionUseCase {
    private final ClassSessionRepository repository;
    @Override public ClassSession create(ClassSession session) {
        session.validate();
        session.touchCreated();
        try {
            return repository.save(session);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateEntityException("ClassSession duplicate violates unique constraint (schedule_block_id, session_date)", ex);
        }
    }
}
