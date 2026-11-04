package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.scheduling_service.domain.exception.ValidationException;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.port.in.CloseClassSessionUseCase;
import com.faceattend_edu.scheduling_service.domain.port.out.ClassSessionRepository;
import com.faceattend_edu.scheduling_service.infrastructure.messaging.DomainEventPublisher;
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
    private final DomainEventPublisher eventPublisher;
    @Override @Transactional
    public ClassSession close(Long id, Long closedBy) {
        ClassSession session = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("ClassSession", id));
        if (session.isClosed()) throw new ValidationException("ClassSession already Closed");
        if (session.isCancelled()) throw new ValidationException("Cannot close a Cancelled session");
        // AGENTS.md 6.8: closing records closed_by/closed_at. Without a resolved academic actor
        // the close would leave closed_by NULL (AUD-27): refuse instead of closing anonymously.
        if (closedBy == null) {
            throw new ValidationException("Cannot close the session: the caller has no academic actor to record in closed_by");
        }
        session.setSessionStatus("Closed");
        session.setClosedBy(closedBy);
        session.setClosedAt(Instant.now());
        session.touchUpdated();
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
