package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.application.access.SchedulingAccessPolicy;
import com.faceattend_edu.scheduling_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.port.in.DeleteClassSessionUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.ClassSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeleteClassSessionUseCaseImpl implements DeleteClassSessionUseCase {
    private final ClassSessionRepository repository;
    private final SchedulingAccessPolicy access;

    /** Soft delete (AGENTS.md 2.2): the JPA entity turns deleteById into an UPDATE of deleted_at. */
    @Override public void delete(Caller caller, Long id) {
        ClassSession found = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("ClassSession", id));
        access.requireSessionAccess(caller, found);
        access.requireRunsClass(caller, found);
        repository.deleteById(id);
    }
}
