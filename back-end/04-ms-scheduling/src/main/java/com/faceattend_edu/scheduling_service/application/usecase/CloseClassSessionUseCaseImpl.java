package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.application.access.SchedulingAccessPolicy;
import com.faceattend_edu.scheduling_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.port.in.CloseClassSessionUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.ClassSessionRepository;
import com.faceattend_edu.scheduling_service.domain.port.out.EventPublisherPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class CloseClassSessionUseCaseImpl implements CloseClassSessionUseCase {
    /** Notification (08) consumes it to record absences and alert the instructor. */
    public static final String CLOSED_TOPIC = "scheduling.class-session.closed";

    private final ClassSessionRepository repository;
    private final EventPublisherPort eventPublisher;
    private final SchedulingAccessPolicy access;

    @Override @Transactional
    public ClassSession close(Caller caller, Long id) {
        ClassSession session = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("ClassSession", id));
        access.requireSessionAccess(caller, session);
        access.requireIsClassInstructor(caller, session);
        session.close(caller.actorId(), Instant.now());
        ClassSession saved = repository.save(session);
        eventPublisher.publish(CLOSED_TOPIC, closedEvent(saved));
        return saved;
    }

    static String closedEvent(ClassSession session) {
        return "{\"eventType\":\"ClassSessionClosed\",\"classSessionId\":" + session.getClassSessionId()
                + ",\"scheduleBlockId\":" + session.getScheduleBlockId()
                + ",\"sessionDate\":\"" + session.getSessionDate() + "\""
                + ",\"closedAt\":\"" + session.getClosedAt() + "\"}";
    }
}
