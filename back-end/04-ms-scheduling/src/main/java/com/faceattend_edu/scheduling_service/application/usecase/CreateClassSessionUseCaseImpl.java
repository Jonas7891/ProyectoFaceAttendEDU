package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.application.access.SchedulingAccessPolicy;
import com.faceattend_edu.scheduling_service.domain.exception.DuplicateEntityException;
import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.port.in.CreateClassSessionUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.ClassSessionRepository;
import com.faceattend_edu.scheduling_service.domain.port.out.EventPublisherPort;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class CreateClassSessionUseCaseImpl implements CreateClassSessionUseCase {
    private final ClassSessionRepository repository;
    private final EventPublisherPort eventPublisher;
    private final SchedulingAccessPolicy access;

    @Override public ClassSession create(Caller caller, ClassSession session) {
        access.requireSessionAccess(caller, session);
        access.requireRunsClass(caller, session);
        // Neither the status nor opened_by/opened_at come from the client (AUD-67).
        session.startOpen(caller.actorId(), Instant.now());
        session.touchCreated();
        session.validate();
        try {
            ClassSession saved = repository.save(session);
            eventPublisher.publish("class-session-events", "{\"classSessionId\":" + saved.getClassSessionId() + ",\"scheduleBlockId\":" + saved.getScheduleBlockId() + "}");
            return saved;
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateEntityException("ClassSession duplicate violates unique constraint (schedule_block_id, session_date)", ex);
        }
    }
}
