package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.application.access.SchedulingAccessPolicy;
import com.faceattend_edu.scheduling_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.port.in.OpenClassSessionUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.ClassSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class OpenClassSessionUseCaseImpl implements OpenClassSessionUseCase {
    private final ClassSessionRepository repository;
    private final SchedulingAccessPolicy access;

    @Override @Transactional
    public ClassSession open(Caller caller, Long id) {
        ClassSession session = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("ClassSession", id));
        access.requireSessionAccess(caller, session);
        access.requireIsClassInstructor(caller, session);
        session.open(caller.actorId(), Instant.now());
        return repository.save(session);
    }
}
