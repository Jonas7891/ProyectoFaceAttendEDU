package com.faceattend_edu.attendance_service.application.usecase;

import com.faceattend_edu.attendance_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.attendance_service.domain.exception.ValidationException;
import com.faceattend_edu.attendance_service.domain.model.Justification;
import com.faceattend_edu.attendance_service.domain.port.in.ReviewJustificationUseCase;
import com.faceattend_edu.attendance_service.domain.port.out.JustificationRepository;
import com.faceattend_edu.attendance_service.domain.port.out.JustificationTypeRepository;
import com.faceattend_edu.attendance_service.domain.port.out.SupportingDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

/**
 * Review of a justification: {@code Pending -> Approved | Rejected}, once.
 * A resolved justification is final, and approving one whose type requires an
 * attachment needs at least one supporting document.
 */
@Service
@RequiredArgsConstructor
public class ReviewJustificationUseCaseImpl implements ReviewJustificationUseCase {
    private final JustificationRepository repository;
    private final JustificationTypeRepository typeRepository;
    private final SupportingDocumentRepository documentRepository;
    private static final Set<String> ALLOWED = Set.of("Approved","Rejected","Pending");

    @Override @Transactional
    public Justification review(Long id, String reviewStatus, UUID reviewedBy, String resolutionNotes){
        Justification j = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Justification", id));
        if (reviewStatus == null || !ALLOWED.contains(reviewStatus)) throw new ValidationException("reviewStatus must be one of " + ALLOWED);
        if ("Pending".equals(reviewStatus)) throw new ValidationException("Cannot review to Pending");
        if (!"Pending".equals(j.getReviewStatus())) {
            throw new ValidationException("Justification already " + j.getReviewStatus() + "; a resolved justification cannot be reviewed again");
        }
        if ("Approved".equals(reviewStatus) && requiresAttachment(j) && documentRepository.findByJustificationId(id).isEmpty()) {
            throw new ValidationException("This justification type requires at least one supporting document before it can be approved");
        }
        j.setReviewStatus(reviewStatus);
        j.setReviewedBy(reviewedBy);
        j.setReviewedAt(Instant.now());
        j.setResolutionNotes(resolutionNotes);
        j.touchUpdated();
        return repository.save(j);
    }

    private boolean requiresAttachment(Justification j) {
        return typeRepository.findById(j.getJustificationTypeId())
                .map(type -> Boolean.TRUE.equals(type.getRequiresAttachment()))
                .orElse(false);
    }
}
