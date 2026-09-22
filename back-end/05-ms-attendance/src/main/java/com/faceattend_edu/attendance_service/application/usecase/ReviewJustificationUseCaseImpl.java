package com.faceattend_edu.attendance_service.application.usecase;

import com.faceattend_edu.attendance_service.domain.exception.EntityNotFoundException;
import com.faceattend_edu.attendance_service.domain.exception.ValidationException;
import com.faceattend_edu.attendance_service.domain.model.Justification;
import com.faceattend_edu.attendance_service.domain.port.in.ReviewJustificationUseCase;
import com.faceattend_edu.attendance_service.domain.port.out.JustificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewJustificationUseCaseImpl implements ReviewJustificationUseCase {
    private final JustificationRepository repository;
    private static final Set<String> ALLOWED = Set.of("Approved","Rejected","Pending");
    @Override @Transactional
    public Justification review(Long id, String reviewStatus, UUID reviewedBy, String resolutionNotes){
        Justification j = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Justification", id));
        if (reviewStatus == null || !ALLOWED.contains(reviewStatus)) throw new ValidationException("reviewStatus must be one of " + ALLOWED);
        if ("Pending".equals(reviewStatus)) throw new ValidationException("Cannot review to Pending");
        j.setReviewStatus(reviewStatus);
        j.setReviewedBy(reviewedBy);
        j.setReviewedAt(Instant.now());
        j.setResolutionNotes(resolutionNotes);
        j.touchUpdated();
        return repository.save(j);
    }
}
