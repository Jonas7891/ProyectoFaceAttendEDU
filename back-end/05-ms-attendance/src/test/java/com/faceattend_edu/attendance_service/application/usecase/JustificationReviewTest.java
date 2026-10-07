package com.faceattend_edu.attendance_service.application.usecase;

import com.faceattend_edu.attendance_service.domain.exception.DuplicateEntityException;
import com.faceattend_edu.attendance_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.attendance_service.domain.exception.ValidationException;
import com.faceattend_edu.attendance_service.domain.model.Justification;
import com.faceattend_edu.attendance_service.domain.port.out.JustificationRepository;
import com.faceattend_edu.attendance_service.infrastructure.messaging.DomainEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JustificationReviewTest {

    private static final long ID = 5L;
    private static final long RECORD = 9L;

    @Mock JustificationRepository repository;
    @Mock DomainEventPublisher eventPublisher;

    private CreateJustificationUseCaseImpl create;
    private ReviewJustificationUseCaseImpl review;

    @BeforeEach
    void setUp() {
        create = new CreateJustificationUseCaseImpl(repository, eventPublisher);
        review = new ReviewJustificationUseCaseImpl(repository);
        lenient().when(repository.save(any(Justification.class))).thenAnswer(call -> call.getArgument(0));
    }

    private Justification pending() {
        Justification j = new Justification();
        j.setJustificationId(ID);
        j.setAttendanceRecordId(RECORD);
        j.setJustificationTypeId(1);
        j.setReason("Medical appointment");
        j.setReviewStatus("Pending");
        return j;
    }

    @Test
    void aNewJustificationStartsPendingWithASubmissionTime() {
        Justification input = pending();
        input.setReviewStatus(null);
        input.setJustificationId(null);
        when(repository.findByAttendanceRecordId(RECORD)).thenReturn(Optional.empty());

        Justification saved = create.create(input);

        assertEquals("Pending", saved.getReviewStatus());
        assertNotNull(saved.getSubmittedAt());
    }

    @Test
    void onlyOneJustificationPerAttendanceRecord() {
        when(repository.findByAttendanceRecordId(RECORD)).thenReturn(Optional.of(pending()));

        assertThrows(DuplicateEntityException.class, () -> create.create(pending()));
        verify(repository, never()).save(any());
    }

    @Test
    void aRaceOnTheUniqueConstraintIsADuplicate() {
        Justification input = pending();
        when(repository.findByAttendanceRecordId(RECORD)).thenReturn(Optional.empty());
        when(repository.save(input)).thenThrow(new DataIntegrityViolationException("uq_justification_record"));

        assertThrows(DuplicateEntityException.class, () -> create.create(input));
    }

    @Test
    void aReasonIsRequired() {
        Justification input = pending();
        input.setReason("  ");

        assertThrows(IllegalArgumentException.class, () -> create.create(input));
    }

    @Test
    void approvingRecordsTheReviewerTheTimeAndTheNotes() {
        UUID reviewer = UUID.randomUUID();
        when(repository.findById(ID)).thenReturn(Optional.of(pending()));

        Justification result = review.review(ID, "Approved", reviewer, "Certificate verified");

        assertEquals("Approved", result.getReviewStatus());
        assertEquals(reviewer, result.getReviewedBy());
        assertNotNull(result.getReviewedAt());
        assertEquals("Certificate verified", result.getResolutionNotes());
    }

    @Test
    void rejectingWorksTheSameWay() {
        UUID reviewer = UUID.randomUUID();
        when(repository.findById(ID)).thenReturn(Optional.of(pending()));

        Justification result = review.review(ID, "Rejected", reviewer, "Document unreadable");

        assertEquals("Rejected", result.getReviewStatus());
        assertEquals(reviewer, result.getReviewedBy());
    }

    @Test
    void aReviewCannotGoBackToPending() {
        when(repository.findById(ID)).thenReturn(Optional.of(pending()));

        assertThrows(ValidationException.class, () -> review.review(ID, "Pending", UUID.randomUUID(), null));
        verify(repository, never()).save(any());
    }

    @Test
    void anUnknownStatusIsRejected() {
        when(repository.findById(ID)).thenReturn(Optional.of(pending()));

        assertThrows(ValidationException.class, () -> review.review(ID, "Maybe", UUID.randomUUID(), null));
        assertThrows(ValidationException.class, () -> review.review(ID, null, UUID.randomUUID(), null));
    }

    @Test
    void reviewingAMissingJustificationIsNotFound() {
        when(repository.findById(ID)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> review.review(ID, "Approved", UUID.randomUUID(), null));
    }
}
