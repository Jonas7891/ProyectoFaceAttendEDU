package com.faceattend_edu.scheduling_service.application.usecase;

import com.faceattend_edu.scheduling_service.domain.exception.DuplicateEntityException;
import com.faceattend_edu.scheduling_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.scheduling_service.domain.exception.ValidationException;
import com.faceattend_edu.scheduling_service.application.access.SchedulingAccessPolicy;
import com.faceattend_edu.scheduling_service.domain.model.Caller;
import com.faceattend_edu.scheduling_service.domain.model.ClassSession;
import com.faceattend_edu.scheduling_service.domain.port.out.ClassSessionRepository;
import com.faceattend_edu.scheduling_service.domain.port.out.EventPublisherPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Open -> Closed | Cancelled, with the closing actor recorded. */
@ExtendWith(MockitoExtension.class)
class ClassSessionTransitionsTest {

    private static final long ID = 7L;

    @Mock ClassSessionRepository repository;
    @Mock EventPublisherPort eventPublisher;
    @Mock SchedulingAccessPolicy access;

    private OpenClassSessionUseCaseImpl open;
    private CloseClassSessionUseCaseImpl close;
    private CancelClassSessionUseCaseImpl cancel;
    private CreateClassSessionUseCaseImpl create;

    @BeforeEach
    void setUp() {
        open = new OpenClassSessionUseCaseImpl(repository, access);
        close = new CloseClassSessionUseCaseImpl(repository, eventPublisher, access);
        cancel = new CancelClassSessionUseCaseImpl(repository, access);
        create = new CreateClassSessionUseCaseImpl(repository, eventPublisher, access);
        lenient().when(repository.save(any(ClassSession.class))).thenAnswer(call -> call.getArgument(0));
    }

    private ClassSession sessionIn(String status) {
        ClassSession session = new ClassSession();
        session.setClassSessionId(ID);
        session.setScheduleBlockId(1L);
        session.setSessionDate(LocalDate.of(2026, 3, 2));
        session.setSessionStatus(status);
        return session;
    }

    private void existing(String status) {
        when(repository.findById(ID)).thenReturn(Optional.of(sessionIn(status)));
    }

    @Test
    void closingAnOpenSessionRecordsWhoAndWhen() {
        existing("Open");

        ClassSession result = close.close(Caller.unrestricted(55L), ID);

        assertEquals("Closed", result.getSessionStatus());
        assertEquals(55L, result.getClosedBy());
        assertNotNull(result.getClosedAt());
    }

    @Test
    void closingWithoutAResolvedActorFailsExplicitlyInsteadOfLeavingClosedByNull() {
        existing("Open");

        ValidationException e = assertThrows(ValidationException.class, () -> close.close(Caller.UNRESTRICTED, ID));

        org.junit.jupiter.api.Assertions.assertTrue(e.getMessage().contains("closed_by"), e.getMessage());
        verify(repository, never()).save(any());
        verify(eventPublisher, never()).publish(any(), any());
    }

    @Test
    void closingASessionPublishesTheEventTheNotificationServiceListensTo() {
        existing("Open");

        close.close(Caller.unrestricted(55L), ID);

        org.mockito.ArgumentCaptor<String> payload = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(eventPublisher).publish(org.mockito.ArgumentMatchers.eq("scheduling.class-session.closed"), payload.capture());
        String json = payload.getValue();
        org.junit.jupiter.api.Assertions.assertTrue(json.contains("\"eventType\":\"ClassSessionClosed\""), json);
        org.junit.jupiter.api.Assertions.assertTrue(json.contains("\"classSessionId\":" + ID), json);
        org.junit.jupiter.api.Assertions.assertTrue(json.contains("\"scheduleBlockId\":1"), json);
        org.junit.jupiter.api.Assertions.assertTrue(json.contains("\"sessionDate\":\"2026-03-02\""), json);
    }

    @Test
    void aSessionThatCannotBeClosedPublishesNothing() {
        existing("Closed");

        assertThrows(ValidationException.class, () -> close.close(Caller.unrestricted(1L), ID));

        verify(eventPublisher, never()).publish(any(), any());
    }

    @Test
    void cancellingAnOpenSessionIsAllowed() {
        existing("Open");

        assertEquals("Cancelled", cancel.cancel(Caller.UNRESTRICTED, ID).getSessionStatus());
    }

    @Test
    void aClosedSessionCannotBeCancelledOrClosedAgain() {
        existing("Closed");

        assertThrows(ValidationException.class, () -> cancel.cancel(Caller.UNRESTRICTED, ID));
        assertThrows(ValidationException.class, () -> close.close(Caller.unrestricted(1L), ID));
        verify(repository, never()).save(any());
    }

    @Test
    void aCancelledSessionCannotBeClosedOrOpenedAgain() {
        existing("Cancelled");

        assertThrows(ValidationException.class, () -> close.close(Caller.unrestricted(1L), ID));
        assertThrows(ValidationException.class, () -> open.open(Caller.unrestricted(1L), ID));
        assertThrows(ValidationException.class, () -> cancel.cancel(Caller.UNRESTRICTED, ID));
        verify(repository, never()).save(any());
    }

    @Test
    void anAlreadyOpenSessionCannotBeOpenedTwice() {
        existing("Open");

        assertThrows(ValidationException.class, () -> open.open(Caller.unrestricted(1L), ID));
    }

    @Test
    void transitionsOnAMissingSessionAreNotFound() {
        when(repository.findById(ID)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> close.close(Caller.unrestricted(1L), ID));
        assertThrows(EntityNotFoundException.class, () -> cancel.cancel(Caller.UNRESTRICTED, ID));
        assertThrows(EntityNotFoundException.class, () -> open.open(Caller.unrestricted(1L), ID));
    }

    @Test
    void aNewSessionWithoutStatusStartsOpen() {
        ClassSession input = sessionIn(null);
        input.setClassSessionId(null);

        ClassSession saved = create.create(Caller.UNRESTRICTED, input);

        assertEquals("Open", saved.getSessionStatus());
    }

    @Test
    void aNewOpenSessionIsSavedWithRowVersionOne() {
        ClassSession input = sessionIn("Open");
        input.setClassSessionId(null);

        ClassSession saved = create.create(Caller.UNRESTRICTED, input);

        assertEquals("Open", saved.getSessionStatus());
        assertEquals(1L, saved.getRowVersion());
    }

    @Test
    void rejectsAStatusOutsideTheEnum() {
        ClassSession input = sessionIn("Paused");

        assertThrows(ValidationException.class, () -> create.create(Caller.UNRESTRICTED, input));
        verify(repository, never()).save(any());
    }

    @Test
    void twoSessionsForTheSameBlockAndDateAreADuplicate() {
        ClassSession input = sessionIn("Open");
        when(repository.save(input)).thenThrow(new DataIntegrityViolationException("uq_session_block_date"));

        assertThrows(DuplicateEntityException.class, () -> create.create(Caller.UNRESTRICTED, input));
    }
}
